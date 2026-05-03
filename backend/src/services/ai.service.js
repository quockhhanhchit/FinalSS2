const {
  GoogleGenerativeAI,
  FunctionCallingMode,
  SchemaType,
} = require("@google/generative-ai");
const pool = require("../config/db");
const budgetService = require("./budget.service");
const dashboardService = require("./dashboard.service");
const planService = require("./plan.service");

const MAX_DAILY_CHAT_REQUESTS = 40;
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function getWeekKey(date = new Date()) {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() + 4 - (current.getDay() || 7));
  const yearStart = new Date(current.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);

  return `${current.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getTodayDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeLanguage(language) {
  return language === "en" ? "en" : "vi";
}

function getMealSlot(mealTime) {
  const t = String(mealTime || "").toLowerCase();
  if (t.includes("breakfast") || t.includes("sang") || t.includes("sáng")) return "breakfast";
  if (t.includes("lunch") || t.includes("trua") || t.includes("trưa")) return "lunch";
  if (t.includes("dinner") || t.includes("toi") || t.includes("tối")) return "dinner";
  if (t.includes("snack") || t.includes("phu") || t.includes("phụ")) return "snack";
  return "unknown";
}

function ensureAiIsConfigured() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error(
      "AI assistant is unavailable because GEMINI_API_KEY is not configured."
    );
    error.status = 503;
    throw error;
  }
}

function getGeminiModel(tools, instructions) {
  ensureAiIsConfigured();

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return client.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction: instructions,
    tools,
    toolConfig: tools?.length
      ? {
        functionCallingConfig: {
          mode: FunctionCallingMode.AUTO,
        },
      }
      : undefined,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });
}

function getChatLimitError(language) {
  return language === "en"
    ? `You have used all ${MAX_DAILY_CHAT_REQUESTS} AI requests for today. Please come back tomorrow.`
    : `Bạn đã dùng hết ${MAX_DAILY_CHAT_REQUESTS} lượt AI hôm nay. Hãy quay lại vào ngày mai nhé.`;
}

function getUnavailableMessage(language) {
  return language === "en"
    ? "The AI coach is not configured yet. Add GEMINI_API_KEY to the backend .env first."
    : "Tro ly AI chua duoc cau hinh. Hay them GEMINI_API_KEY vao file .env cua backend truoc.";
}

function getOffTopicMessage(language) {
  return language === "en"
    ? "I only support BudgetFit topics: meals, workouts, calories, budget, and progress. Ask me something in that scope and I will help right away."
    : "Minh chi ho tro cac chu de trong BudgetFit: bua an, bai tap, calo, ngan sach va tien do. Ban hoi dung pham vi nay la minh ho tro ngay.";
}

function hasSwapIntent(message) {
  const text = String(message || "").toLowerCase();

  return [
    "doi",
    "thay",
    "swap",
    "change",
    "replace",
    "thay the",
    "doi cho toi",
    "doi giup",
  ].some((keyword) => text.includes(keyword));
}

function getSwapNotAppliedMessage(language, reason = "") {
  if (language === "en") {
    return reason
      ? `I have not updated your plan yet. ${reason}`
      : "I have not updated your plan yet because the swap did not complete successfully.";
  }

  return reason
    ? `Mình chưa cập nhật được vào kế hoạch của bạn. ${reason}`
    : "Mình chưa cập nhật được vào kế hoạch của bạn vì thao tác đổi món hoặc bài tập chưa chạy thành công.";
}

function extractGeminiText(result) {
  const text = result?.response?.text?.();
  return typeof text === "string" ? text.trim() : "";
}

function extractFunctionCalls(result) {
  return result?.response?.functionCalls?.() || [];
}

function buildChatHistoryInput(history) {
  const formatted = history.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.message_text }],
  }));

  while (formatted.length > 0 && formatted[0].role !== "user") {
    formatted.shift();
  }

  const strictHistory = [];
  let nextExpected = "user";
  for (const msg of formatted) {
    if (msg.role === nextExpected) {
      strictHistory.push(msg);
      nextExpected = nextExpected === "user" ? "model" : "user";
    }
  }

  while (strictHistory.length > 0 && strictHistory[strictHistory.length - 1].role !== "model") {
    strictHistory.pop();
  }

  return strictHistory;
}

function getBaseAssistantPrompt(language, contextText) {
  if (language === "en") {
    return [
    "You are BudgetFit's virtual coach named em Dat.",
      "Only answer topics related to fitness, workouts, diet, calories, budget, plan progress, and weekly analytics inside BudgetFit.",
      "If the user asks about coding, politics, religion, gambling, or any unrelated topic, politely refuse and redirect them back to BudgetFit topics.",
      "Never hallucinate numbers. Use only the provided user context. If data is missing, say that clearly.",
      "When suggesting food, you must stay within the user's remaining budget today and mention the budget number when relevant.",
      "If the user asks for a specific dish or workout that is not in the normal dataset, you may estimate it and then use the custom generation tools.",
      "For custom meals, estimated_cost must not exceed remaining_today_vnd. If it is too expensive, lower the portion or refuse.",
      "For custom meals, keep calories aligned with the user's current daily goal. Do not create a meal that clearly blows past the current plan target.",
      "Never claim that you updated, swapped, or saved anything unless a tool call actually succeeded and returned ok: true.",
      "If a tool fails, clearly explain that the update did not happen yet.",
      "Be friendly, direct, and practical. Use short Markdown. Prefer 1 short paragraph or 3-5 bullets.",
      "WHEN CALLING SWAP MEAL TOOLS: You MUST use the 'slot' field of each meal in today_plan to identify the correct meal — slot='breakfast' means morning meal, slot='lunch' means midday meal, slot='dinner' means evening meal, slot='snack' means snack. If the user says 'breakfast', pick the meal whose slot='breakfast' and pass its exact id as meal_id. NEVER infer the meal slot from the meal name — a custom meal name like 'Cao Lau Hai San' does NOT indicate its slot; only the 'slot' field does.",
      "WHEN CALLING SWAP WORKOUT TOOLS: You MUST pass the exact workout_id from the workouts list in today_plan.",
      "If the user asks to change today's meal or workout, you may call the provided tools instead of only giving advice.",
      "User context follows below:",
      contextText,
    ].join("\n");
  }

  return [
    "Ban la tro ly ao cua BudgetFit ten la em Dat.",
    "Chi tra loi cac chu de lien quan toi fitness, bai tap, an uong, calo, ngan sach, tien do ke hoach va thong ke trong BudgetFit.",
    "Neu nguoi dung hoi ve code, chinh tri, ton giao, co bac hoac chu de ngoai pham vi du an, hay tu choi lich su va keo ho quay lai cac chu de cua BudgetFit.",
    "Khong duoc bia so lieu. Chi dung du lieu trong ngu canh da cap. Neu thieu du lieu thi noi ro la thieu du lieu.",
    "Khi goi y mon an, phai nam trong ngan sach con lai hom nay cua nguoi dung va nen nhac ro con so ngan sach khi phu hop.",
    "Neu nguoi dung muon mot mon an dac biet hoac bai tap khong nam trong dataset, ban duoc phep uoc tinh hop ly roi dung tool custom de cap nhat truc tiep vao lich.",
    "Voi mon an custom, estimated_cost bat buoc khong duoc vuot remaining_today_vnd. Neu qua ngan sach thi hay giam khau phan hoac tu choi.",
    "Voi mon an custom, calo phai bam sat muc tieu hien tai trong ngay, khong duoc uoc tinh vo ly lam vo ke hoach.",
    "Tuyet doi khong duoc noi rang da doi, da cap nhat, da luu neu tool chua chay thanh cong va tra ve ok: true.",
    "Neu tool that bai thi phai noi ro la viec cap nhat chua xay ra.",
    "Giong dieu than thien, ngan gon, thuc dung. Tra loi bang Markdown ngan, uu tien 1 doan ngan hoac 3-5 gach dau dong.",
    "KHI GOI TOOL SWAP MON AN: Ban BUOC PHAI dung truong 'slot' cua moi mon trong bua_an de xac dinh bua can doi — slot='breakfast' la bua sang, slot='lunch' la bua trua, slot='dinner' la bua toi, slot='snack' la bua phu. Neu nguoi dung noi 'bua sang', hay chon mon co slot='breakfast' va truyen id cua mon do vao meal_id. TUYET DOI KHONG suy ra slot tu ten mon an — ten custom nhu 'Cao Lau Hai San' khong phan anh bua an, chi co truong slot moi chinh xac.",
    "KHI GOI TOOL SWAP BAI TAP: Truyen dung workout_id lay tu danh sach bai_tap trong ke_hoach_hom_nay.",
    "Neu nguoi dung muon doi mon an hoac doi bai tap trong he thong, ban co the dung cac tool da duoc cap thay vi chi tu van suong.",
    "Ngu canh that cua nguoi dung o duoi day:",
    contextText,
  ].join("\n");
}

function buildWeeklySummaryPrompt(language, contextText) {
  if (language === "en") {
    return [
      "You are BudgetFit's weekly coach.",
      "Write a weekly summary in at most 3 short sentences.",
      "Mention progress, spending discipline, and include a warning if spending is over budget or adherence is weak.",
      "Stay grounded in the provided data only.",
      contextText,
    ].join("\n");
  }

  return [
    "Ban la tro ly tong ket tuan cua BudgetFit.",
    "Hay viet nhan xet tuan nay trong toi da 3 cau ngan.",
    "Phai nhac toi tien do, ky luat chi tieu, va canh bao neu chi qua ngan sach hoac bam sat ke hoach kem.",
    "Chi dung du lieu da duoc cung cap.",
    contextText,
  ].join("\n");
}

function isOffTopicMessage(message) {
  const text = String(message || "").toLowerCase();
  const offTopicPatterns = [
    /\breact\b/,
    /\bjavascript\b/,
    /\bnode\b/,
    /\bpython\b/,
    /\bcode\b/,
    /\blap trinh\b/,
    /\bchinh tri\b/,
    /\bpolitic/i,
    /\bbau cu\b/,
    /\belection\b/,
    /\bwar\b/,
    /\bchien tranh\b/,
    /\bton giao\b/,
    /\breligion\b/,
  ];

  return offTopicPatterns.some((pattern) => pattern.test(text));
}

function getToolDefinitions() {
  return [
    {
      functionDeclarations: [
        {
          name: "swap_meal",
          description:
            "Doi mot mon an trong lich cua nguoi dung sang mon khac cung khung bua, co the kem so thich nhu it dau, re hon, nhieu dam hon.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              day_number: {
                type: SchemaType.INTEGER,
                description: "So ngay trong ke hoach can doi mon.",
              },
              meal_id: {
                type: SchemaType.INTEGER,
                description: "ID cua mon an can doi. Lay tu truong 'id' trong danh sach bua_an. Xac dinh dung bua bang truong 'slot': slot='breakfast' la bua sang, slot='lunch' la bua trua, slot='dinner' la bua toi, slot='snack' la bua phu. Neu nguoi dung noi 'bua sang' phai lay id cua mon co slot='breakfast', khong phu thuoc vao ten mon.",
              },
              preference: {
                type: SchemaType.STRING,
                description:
                  "Slot cua bua muon doi: 'breakfast', 'lunch', 'dinner', hoac 'snack'. Phai khop voi slot cua meal_id da chon.",
              },
            },
            required: ["day_number", "meal_id", "preference"],
          },
        },
        {
          name: "swap_workout",
          description:
            "Doi mot bai tap trong lich hien tai cua nguoi dung, vi du doi sang strength, cardio, hiit hoac thien ve tay, lung, nguc.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              day_number: {
                type: SchemaType.INTEGER,
                description: "So ngay trong ke hoach can doi bai tap.",
              },
              workout_id: {
                type: SchemaType.INTEGER,
                description: "ID cua bai tap can doi.",
              },
              new_workout_genre: {
                type: SchemaType.STRING,
                description:
                  "The loai hoac vung co mong muon, vi du strength, cardio, hiit, tay, nguc, lung.",
              },
            },
            required: ["day_number", "workout_id", "new_workout_genre"],
          },
        },
        {
          name: "generate_and_swap_meal",
          description:
            "Tu uoc tinh mot mon an custom roi cap nhat truc tiep vao lich cua nguoi dung. Chi dung khi khong co mon phu hop trong dataset va mon moi van nam trong ngan sach/calo cho phep.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              day_number: {
                type: SchemaType.INTEGER,
                description: "So ngay trong ke hoach can doi mon.",
              },
              meal_id: {
                type: SchemaType.INTEGER,
                description:
                  "ID cua mon an can thay the. BUOC PHAI lay chinh xac tu truong 'id' trong danh sach bua_an cua ke_hoach_hom_nay. De tim dung mon: dung truong 'slot' cua moi mon de xac dinh bua - slot='breakfast' la bua sang, slot='lunch' la bua trua, slot='dinner' la bua toi, slot='snack' la bua phu. Neu nguoi dung noi 'bua sang' thi lay id cua mon co slot='breakfast'. Tuyet doi khong dung ten mon an de suy ra slot.",
              },
              preference: {
                type: SchemaType.STRING,
                description:
                  "Ten bua can doi: 'breakfast' (bua sang), 'lunch' (bua trua), 'dinner' (bua toi), 'snack' (bua phu). Phai khop voi truong 'slot' cua mon an trong danh sach. Dung gia tri nay de xac nhan lai meal_id da chon co dung slot hay khong.",
              },
              custom_meal_name: {
                type: SchemaType.STRING,
                description: "Ten mon moi, vi du Cao Lau Hai San, My Quang Ga.",
              },
              estimated_calories: {
                type: SchemaType.INTEGER,
                description: "So calo uoc tinh cua mon moi.",
              },
              estimated_cost: {
                type: SchemaType.INTEGER,
                description:
                  "Gia uoc tinh cua mon moi bang VND, khong duoc vuot ngan sach con lai hom nay.",
              },
              description: {
                type: SchemaType.STRING,
                description:
                  "Mo ta ngan tai sao mon nay hop voi nguoi dung va cach uoc tinh.",
              },
            },
            required: [
              "day_number",
              "meal_id",
              "preference",
              "custom_meal_name",
              "estimated_calories",
              "estimated_cost",
              "description",
            ],
          },
        },

        {
          name: "generate_and_swap_workout",
          description:
            "Tu uoc tinh bai tap custom roi cap nhat truc tiep vao lich cua nguoi dung khi workout mong muon khong co trong dataset.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              day_number: {
                type: SchemaType.INTEGER,
                description: "So ngay trong ke hoach can doi bai tap.",
              },
              workout_id: {
                type: SchemaType.INTEGER,
                description: "ID bai tap can thay the.",
              },
              custom_workout_name: {
                type: SchemaType.STRING,
                description: "Ten bai tap custom.",
              },
              duration_minutes: {
                type: SchemaType.INTEGER,
                description: "So phut uoc tinh cho bai tap.",
              },
              calories_burned: {
                type: SchemaType.INTEGER,
                description: "So calo dot duoc uoc tinh.",
              },
              description: {
                type: SchemaType.STRING,
                description: "Huong dan ngan gon hoac cach thuc hien.",
              },
            },
            required: [
              "day_number",
              "workout_id",
              "custom_workout_name",
              "duration_minutes",
              "calories_burned",
              "description",
            ],
          },
        },
      ],
    },
  ];
}

async function generateGeminiText({ instructions, message, history = [], tools = [] }) {
  const model = getGeminiModel(tools, instructions);
  const chat = model.startChat({
    history,
  });

  return {
    chat,
    result: await chat.sendMessage(message),
  };
}

async function getRecentChatHistory(userId, limit = 8) {
  const [rows] = await pool.query(
    `SELECT role, message_text, created_at
     FROM ai_chat_messages
     WHERE user_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ?`,
    [userId, limit]
  );

  return rows.reverse();
}

async function clearChatHistory(userId) {
  await pool.query(
    `DELETE FROM ai_chat_messages
     WHERE user_id = ?`,
    [userId]
  );
}

async function storeChatMessage(userId, role, messageText) {
  await pool.query(
    `INSERT INTO ai_chat_messages (user_id, role, message_text)
     VALUES (?, ?, ?)`,
    [userId, role, String(messageText || "").trim()]
  );
}

async function countDailyUsage(userId, usageType = "chat") {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM ai_usage_logs
     WHERE user_id = ?
       AND usage_type = ?
       AND DATE(created_at) = CURDATE()`,
    [userId, usageType]
  );

  return Number(row?.total || 0);
}

async function storeUsage(userId, usageType = "chat") {
  await pool.query(
    `INSERT INTO ai_usage_logs (user_id, usage_type)
     VALUES (?, ?)`,
    [userId, usageType]
  );
}

async function getCurrentPlanAndDay(userId) {
  const [plans] = await pool.query(
    `SELECT *
     FROM plans
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  const plan = plans[0] || null;

  if (!plan) {
    return { plan: null, todayPlanDay: null, meals: [], workouts: [], completedTasks: [] };
  }

  const [days] = await pool.query(
    `SELECT *
     FROM plan_days
     WHERE plan_id = ?
     ORDER BY
       CASE
         WHEN plan_date = CURDATE() THEN 0
         WHEN plan_date > CURDATE() THEN 1
         ELSE 2
       END,
       ABS(DATEDIFF(plan_date, CURDATE())),
       day_number ASC
     LIMIT 1`,
    [plan.id]
  );

  const todayPlanDay = days[0] || null;

  if (!todayPlanDay) {
    return { plan, todayPlanDay: null, meals: [], workouts: [], completedTasks: [] };
  }

  const [meals] = await pool.query(
    `SELECT id, meal_name, meal_time, calories, cost
     FROM meals
     WHERE plan_day_id = ?
     ORDER BY id ASC`,
    [todayPlanDay.id]
  );
  const [workouts] = await pool.query(
    `SELECT id, workout_name, duration_minutes, description
     FROM workouts
     WHERE plan_day_id = ?
     ORDER BY id ASC`,
    [todayPlanDay.id]
  );
  const [completedRows] = await pool.query(
    `SELECT task_type, task_ref_id
     FROM daily_task_completions
     WHERE plan_day_id = ? AND is_completed = true`,
    [todayPlanDay.id]
  );

  const completedTasks = completedRows.map((row) =>
    row.task_type === "sleep" || row.task_type === "water"
      ? row.task_type
      : `${row.task_type}-${row.task_ref_id}`
  );

  return {
    plan,
    todayPlanDay,
    meals,
    workouts,
    completedTasks,
  };
}

async function buildUserContext(userId) {
  const [profile, budget, dashboardSummary, planContext] = await Promise.all([
    pool
      .query("SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1", [userId])
      .then(([rows]) => rows[0] || null),
    budgetService.getCurrentBudget(userId),
    dashboardService.getDashboardSummary(userId),
    getCurrentPlanAndDay(userId),
  ]);

  const [[todaySpentRow], [weekSpentRow]] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS spentToday
       FROM expense_logs
       WHERE user_id = ? AND category = 'Food' AND log_date = CURDATE()`,
      [userId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS spentThisWeek
       FROM expense_logs
       WHERE user_id = ?
         AND YEARWEEK(log_date, 1) = YEARWEEK(CURDATE(), 1)`,
      [userId]
    ),
  ]);

  const dailyFoodBudget = Number(budget?.food_amount || 0) / 30;
  const spentToday = Number(todaySpentRow?.spentToday || 0);
  const remainingTodayBudget = Math.max(Math.round(dailyFoodBudget - spentToday), 0);

  const completedMealIds = new Set(
    planContext.completedTasks
      .filter((taskId) => String(taskId).startsWith("meal-"))
      .map((taskId) => Number(String(taskId).replace("meal-", "")))
  );

  const consumedCaloriesToday = planContext.meals.reduce((sum, meal) => {
    return completedMealIds.has(Number(meal.id))
      ? sum + Number(meal.calories || 0)
      : sum;
  }, 0);

  const consumedFoodCostToday = planContext.meals.reduce((sum, meal) => {
    return completedMealIds.has(Number(meal.id))
      ? sum + Number(meal.cost || 0)
      : sum;
  }, 0);

  const remainingCaloriesToday = Math.max(
    Number(planContext.todayPlanDay?.planned_calories || 0) - consumedCaloriesToday,
    0
  );

  return {
    profile,
    budget,
    dashboardSummary,
    today: {
      dayNumber: Number(planContext.todayPlanDay?.day_number || 0),
      planDate: planContext.todayPlanDay?.plan_date
        ? getTodayDateKey(new Date(planContext.todayPlanDay.plan_date))
        : null,
      workoutType: planContext.todayPlanDay?.workout_type || null,
      plannedCalories: Number(planContext.todayPlanDay?.planned_calories || 0),
      plannedCost: Number(planContext.todayPlanDay?.planned_cost || 0),
      meals: planContext.meals.map((meal) => ({
        id: Number(meal.id),
        slot: getMealSlot(meal.meal_time),
        name: meal.meal_name,
        meal_time: meal.meal_time,
        calories: Number(meal.calories || 0),
        cost: Number(meal.cost || 0),
      })),
      workouts: planContext.workouts.map((workout) => ({
        id: Number(workout.id),
        name: workout.workout_name,
        duration_minutes: Number(workout.duration_minutes || 0),
        description: workout.description,
      })),
      completedTasks: planContext.completedTasks,
      consumedCaloriesToday,
      consumedFoodCostToday,
      remainingCaloriesToday,
    },
    weekly: {
      spentThisWeek: Number(weekSpentRow?.spentThisWeek || 0),
      daysCompletedThisWeek: Number(
        dashboardSummary?.weeklyStats?.daysCompletedThisWeek || 0
      ),
      workoutsDoneThisWeek: Number(
        dashboardSummary?.weeklyStats?.workoutsDoneThisWeek || 0
      ),
      mealsLoggedThisWeek: Number(
        dashboardSummary?.weeklyStats?.mealsLoggedThisWeek || 0
      ),
    },
    budgetStatus: {
      totalBudget: Number(budget?.total_budget || profile?.budget_total || 0),
      dailyFoodBudget: Math.round(dailyFoodBudget),
      spentToday,
      remainingTodayBudget,
    },
  };
}

function serializeContextForPrompt(context, language) {
  const profile = context.profile || {};
  const today = context.today || {};
  const budgetStatus = context.budgetStatus || {};
  const weekly = context.weekly || {};

  if (language === "en") {
    return JSON.stringify(
      {
        user_profile: {
          age: Number(profile.age || 0),
          gender: profile.gender === "female" ? "female" : "male",
          height_cm: Number(profile.height_cm || 0),
          weight_kg: Number(profile.weight_kg || 0),
          goal_type: profile.goal_type || "lose",
          workout_location: profile.workout_location || "home",
        },
        budget: {
          total_budget_vnd: budgetStatus.totalBudget,
          daily_food_budget_vnd: budgetStatus.dailyFoodBudget,
          spent_today_vnd: budgetStatus.spentToday,
          remaining_today_vnd: budgetStatus.remainingTodayBudget,
          spent_this_week_vnd: weekly.spentThisWeek,
        },
        today_plan: {
          day_number: today.dayNumber,
          date: today.planDate,
          workout_type: today.workoutType,
          planned_calories: today.plannedCalories,
          planned_cost_vnd: today.plannedCost,
          consumed_calories: today.consumedCaloriesToday,
          remaining_calories: today.remainingCaloriesToday,
          meals: today.meals,
          workouts: today.workouts,
          completed_tasks: today.completedTasks,
        },
        weekly_stats: {
          days_completed_this_week: weekly.daysCompletedThisWeek,
          meals_logged_this_week: weekly.mealsLoggedThisWeek,
          workouts_done_this_week: weekly.workoutsDoneThisWeek,
        },
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      thong_tin_nguoi_dung: {
        tuoi: Number(profile.age || 0),
        gioi_tinh: profile.gender === "female" ? "nu" : "nam",
        chieu_cao_cm: Number(profile.height_cm || 0),
        can_nang_kg: Number(profile.weight_kg || 0),
        muc_tieu: profile.goal_type || "lose",
        dia_diem_tap: profile.workout_location || "home",
      },
      ngan_sach: {
        tong_ngan_sach_vnd: budgetStatus.totalBudget,
        ngan_sach_an_hom_nay_vnd: budgetStatus.dailyFoodBudget,
        da_chi_hom_nay_vnd: budgetStatus.spentToday,
        con_lai_hom_nay_vnd: budgetStatus.remainingTodayBudget,
        da_chi_tuan_nay_vnd: weekly.spentThisWeek,
      },
      ke_hoach_hom_nay: {
        ngay_so: today.dayNumber,
        ngay_thuc_te: today.planDate,
        loai_bai_tap: today.workoutType,
        calo_du_kien: today.plannedCalories,
        chi_phi_du_kien_vnd: today.plannedCost,
        calo_da_nap: today.consumedCaloriesToday,
        calo_con_lai: today.remainingCaloriesToday,
        bua_an: today.meals,
        bai_tap: today.workouts,
        task_da_hoan_thanh: today.completedTasks,
      },
      thong_ke_tuan: {
        so_ngay_checkin_thanh_cong: weekly.daysCompletedThisWeek,
        so_bua_an_da_ghi_nhan: weekly.mealsLoggedThisWeek,
        so_bai_tap_da_lam: weekly.workoutsDoneThisWeek,
      },
    },
    null,
    2
  );
}

function findFallbackMealId(todayContext, preference) {
  const normalizedPreference = String(preference || "").toLowerCase();
  const meals = todayContext.meals || [];

  function matchMealTime(meal, patterns) {
    const haystack = String(meal.meal_time || "").toLowerCase();
    return patterns.some((p) => haystack.includes(p));
  }

  // Bữa tối: dinner / tối / 18: / 19: / 20:
  if (
    normalizedPreference.includes("toi") ||
    normalizedPreference.includes("dinner") ||
    normalizedPreference.includes("chieu") ||
    normalizedPreference.includes("evening")
  ) {
    const found = meals.find((meal) =>
      matchMealTime(meal, ["dinner", "toi", "18:", "19:", "20:", "18h", "19h", "20h", "7:00 pm", "6:00 pm"])
    );
    return found?.id || null;
  }

  // Bữa sáng: breakfast / sáng / 7: / 8:
  if (
    normalizedPreference.includes("sang") ||
    normalizedPreference.includes("breakfast") ||
    normalizedPreference.includes("morning")
  ) {
    const found = meals.find((meal) =>
      matchMealTime(meal, ["breakfast", "sang", "7:", "8:", "7h", "8h", "7:00 am", "8:00 am"])
    );
    return found?.id || null;
  }

  // Bữa trưa: lunch / trưa / 11: / 12: / 13:
  if (
    normalizedPreference.includes("trua") ||
    normalizedPreference.includes("lunch") ||
    normalizedPreference.includes("noon")
  ) {
    const found = meals.find((meal) =>
      matchMealTime(meal, ["lunch", "trua", "11:", "12:", "13:", "11h", "12h", "13h", "12:00 pm", "1:00 pm"])
    );
    return found?.id || null;
  }

  // Bữa phụ / snack
  if (
    normalizedPreference.includes("phu") ||
    normalizedPreference.includes("snack") ||
    normalizedPreference.includes("xen") ||
    normalizedPreference.includes("giua")
  ) {
    const found = meals.find((meal) =>
      matchMealTime(meal, ["snack", "phu", "3:", "15:", "16:", "3h", "15h", "16h"])
    );
    return found?.id || null;
  }

  return meals[0]?.id || null;
}

function findFallbackWorkoutId(todayContext, preference) {
  const text = String(preference || "").toLowerCase();
  const priority = todayContext.workouts.find((workout) => {
    const haystack = `${workout.name} ${workout.description || ""}`.toLowerCase();
    return (
      !haystack.includes("khoi dong") &&
      !haystack.includes("warm-up") &&
      !haystack.includes("tha long") &&
      !haystack.includes("cool-down") &&
      (!text || haystack.includes(text))
    );
  });

  return priority?.id || todayContext.workouts[0]?.id || null;
}

function getTodayMealById(todayContext, mealId) {
  return (todayContext.meals || []).find(
    (meal) => Number(meal.id) === Number(mealId)
  );
}

function getTodayWorkoutById(todayContext, workoutId) {
  return (todayContext.workouts || []).find(
    (workout) => Number(workout.id) === Number(workoutId)
  );
}

function getMaxAllowedCustomMealCalories(todayContext, mealId) {
  const meal = todayContext.meals?.find(
    (item) => Number(item.id) === Number(mealId)
  );
  const mealCal = Number(meal?.calories || 0);
  const remaining = Number(todayContext.remainingCaloriesToday || 0);

  return mealCal + remaining;
}

async function executeToolCall(userId, functionCall, context) {
  const args = functionCall.args || {};
  const todayContext = context.today || {};

  if (functionCall.name === "swap_meal") {
    const dayNumber = Number(args.day_number || todayContext.dayNumber || 1);

    // Step 1: check if AI-provided meal_id belongs to today's plan
    let mealId = Number(args.meal_id || 0);
    const mealExistsInDay = mealId > 0 && todayContext.meals?.some((m) => Number(m.id) === mealId);

    if (mealExistsInDay) {
      // Step 2: cross-check that the meal's slot matches the stated preference.
      // Prevents AI passing a valid dinner-ID when the user asked for breakfast.
      const preferenceSlot = getMealSlot(args.preference || "");
      const pickedMeal = todayContext.meals.find((m) => Number(m.id) === mealId);
      const pickedSlot = getMealSlot(pickedMeal?.meal_time || "");
      if (preferenceSlot !== "unknown" && pickedSlot !== "unknown" && preferenceSlot !== pickedSlot) {
        // Slot mismatch — override with the correct slot meal
        mealId = Number(findFallbackMealId(todayContext, args.preference)) || mealId;
      }
    } else {
      // meal_id not in today — derive from preference hint
      const hint = args.preference || String(args.meal_id || "");
      mealId = Number(findFallbackMealId(todayContext, hint));
    }

    if (!mealId) {
      return {
        ok: false,
        message: "Khong tim duoc mon an phu hop de doi trong ngay hien tai.",
      };
    }

    const result = await planService.swapMeal(userId, dayNumber, mealId, {
      preference: args.preference,
    });

    return {
      ok: true,
      action: "swap_meal",
      day_number: dayNumber,
      meal: result.meal,
      planned_cost: result.planned_cost,
      planned_calories: result.planned_calories,
      ui_refresh_required: true,
      confirmation: `Da doi mon an ID ${mealId} cua ngay ${dayNumber}.`,
    };
  }

  if (functionCall.name === "swap_workout") {
    const dayNumber = Number(args.day_number || todayContext.dayNumber || 1);
    const workoutId = Number(
      args.workout_id || findFallbackWorkoutId(todayContext, args.new_workout_genre)
    );

    if (!workoutId) {
      return {
        ok: false,
        message: "Khong tim duoc bai tap phu hop de doi trong ngay hien tai.",
      };
    }

    const result = await planService.swapWorkout(userId, dayNumber, workoutId, {
      preference: args.new_workout_genre,
      preferredType: args.new_workout_genre,
    });

    return {
      ok: true,
      action: "swap_workout",
      day_number: dayNumber,
      workout: result.workout,
      planned_cost: result.planned_cost,
      planned_calories: result.planned_calories,
      ui_refresh_required: true,
      confirmation: `Da doi bai tap ID ${workoutId} cua ngay ${dayNumber}.`,
    };
  }

  if (functionCall.name === "generate_and_swap_meal") {
    const dayNumber = Number(args.day_number || todayContext.dayNumber || 1);

    // Step 1: check if AI-provided meal_id belongs to today's plan
    let mealId = Number(args.meal_id || 0);
    const mealExistsInDay = mealId > 0 && todayContext.meals?.some((m) => Number(m.id) === mealId);

    if (mealExistsInDay) {
      // Step 2: cross-check slot vs preference to catch wrong-slot swaps
      const preferenceSlot = getMealSlot(args.preference || "");
      const pickedMeal = todayContext.meals.find((m) => Number(m.id) === mealId);
      const pickedSlot = getMealSlot(pickedMeal?.meal_time || "");
      if (preferenceSlot !== "unknown" && pickedSlot !== "unknown" && preferenceSlot !== pickedSlot) {
        mealId = Number(findFallbackMealId(todayContext, args.preference)) || mealId;
      }
    } else {
      // meal_id not in today — derive from preference slot hint
      const slotHint = args.preference || "";
      mealId = Number(findFallbackMealId(todayContext, slotHint));
    }

    if (!mealId) {
      return {
        ok: false,
        message: "Khong tim duoc bua an can thay the trong lich hien tai.",
      };
    }

    const estimatedCalories = Number(args.estimated_calories || 0);
    const estimatedCost = Number(args.estimated_cost || 0);
    const remainingBudget = Number(context.budgetStatus?.remainingTodayBudget || 0);
    const maxMealCalories = getMaxAllowedCustomMealCalories(todayContext, mealId);

    // Effective budget = remaining today + cost of the meal being replaced
    // (swapping releases the old meal's cost)
    const currentMealCost = Number(
      todayContext.meals?.find((m) => Number(m.id) === mealId)?.cost || 0
    );
    const effectiveBudget = remainingBudget + currentMealCost;

    if (!Number.isFinite(estimatedCost) || estimatedCost <= 0) {
      return {
        ok: false,
        message: "Chi phi uoc tinh cua mon moi khong hop le.",
      };
    }

    if (estimatedCost > effectiveBudget) {
      return {
        ok: false,
        message: `Mon moi vuot ngan sach hom nay. Co the dung toi ${effectiveBudget} VND nhung mon moi can ${estimatedCost} VND.`,
      };
    }

    if (
      Number.isFinite(maxMealCalories) &&
      maxMealCalories !== null &&
      estimatedCalories > maxMealCalories
    ) {
      return {
        ok: false,
        message: `Mon moi co calo qua cao cho muc tieu hien tai. Nen giu duoi ${maxMealCalories} kcal.`,
      };
    }

    const result = await planService.generateAndSwapMeal(userId, dayNumber, mealId, {
      customMealName: args.custom_meal_name,
      estimatedCalories,
      estimatedCost,
      description: args.description,
    });
    return {
      ok: true,
      action: "generate_and_swap_meal",
      day_number: dayNumber,
      meal: result.meal,
      planned_cost: result.planned_cost,
      planned_calories: result.planned_calories,
      ui_refresh_required: true,
      confirmation: `Da cap nhat mon custom ${args.custom_meal_name} cho ngay ${dayNumber}.`,
    };
  }

  if (functionCall.name === "generate_and_swap_workout") {
    const dayNumber = Number(args.day_number || todayContext.dayNumber || 1);
    const workoutId = Number(
      args.workout_id || findFallbackWorkoutId(todayContext, args.custom_workout_name)
    );

    if (!workoutId) {
      return {
        ok: false,
        message: "Khong tim duoc bai tap can thay the trong lich hien tai.",
      };
    }

    const result = await planService.generateAndSwapWorkout(
      userId,
      dayNumber,
      workoutId,
      {
        customWorkoutName: args.custom_workout_name,
        durationMinutes: Number(args.duration_minutes || 0),
        caloriesBurned: Number(args.calories_burned || 0),
        description: args.description,
      }
    );

    return {
      ok: true,
      action: "generate_and_swap_workout",
      day_number: dayNumber,
      workout: result.workout,
      planned_cost: result.planned_cost,
      planned_calories: result.planned_calories,
      ui_refresh_required: true,
      confirmation: `Da cap nhat bai tap custom ${args.custom_workout_name} cho ngay ${dayNumber}.`,
    };
  }

  return {
    ok: false,
    message: `Unsupported tool call: ${functionCall.name}`,
  };
}

async function getRemainingRequestsToday(userId) {
  const used = await countDailyUsage(userId, "chat");
  return Math.max(MAX_DAILY_CHAT_REQUESTS - used, 0);
}

async function chatWithAssistant(userId, message, language = "vi") {
  const normalizedLanguage = normalizeLanguage(language);
  const trimmedMessage = String(message || "").trim();

  ensureAiIsConfigured();

  if (isOffTopicMessage(trimmedMessage)) {
    return {
      reply: getOffTopicMessage(normalizedLanguage),
      requestsRemaining: await getRemainingRequestsToday(userId),
    };
  }

  const usedRequests = await countDailyUsage(userId, "chat");

  if (usedRequests >= MAX_DAILY_CHAT_REQUESTS) {
    const error = new Error(getChatLimitError(normalizedLanguage));
    error.status = 429;
    throw error;
  }

  const [history, context] = await Promise.all([
    getRecentChatHistory(userId, 8),
    buildUserContext(userId),
  ]);

  await storeUsage(userId, "chat");

  const instructions = getBaseAssistantPrompt(
    normalizedLanguage,
    serializeContextForPrompt(context, normalizedLanguage)
  );
  const tools = getToolDefinitions();

  const { chat, result: firstResult } = await generateGeminiText({
    instructions,
    message: trimmedMessage,
    history: buildChatHistoryInput(history),
    tools,
  });

  let result = firstResult;
  let functionCalls = extractFunctionCalls(result);
  let loopCount = 0;
  const successfulUiActions = [];
  const failedToolMessages = [];

  while (functionCalls.length > 0 && loopCount < 3) {
    const functionResponses = [];

    for (const functionCall of functionCalls) {
      const output = await executeToolCall(userId, functionCall, context);
      if (output?.ok && output?.ui_refresh_required) {
        successfulUiActions.push(output);
      } else if (output?.message) {
        failedToolMessages.push(String(output.message));
      }
      functionResponses.push({
        functionResponse: {
          name: functionCall.name,
          response: output,
        },
      });
    }

    result = await chat.sendMessage(functionResponses);
    functionCalls = extractFunctionCalls(result);
    loopCount += 1;
  }

  let reply =
    extractGeminiText(result) ||
    (normalizedLanguage === "en"
      ? "I could not generate a useful answer. Please try asking in a more specific way."
      : "Minh chua tao duoc cau tra loi du ro. Ban thu hoi cu the hon mot chut nhe.");

  if (hasSwapIntent(trimmedMessage) && successfulUiActions.length === 0) {
    reply = getSwapNotAppliedMessage(normalizedLanguage, failedToolMessages[0]);
  }

  const affectedDayNumbers = [
    ...new Set(
      successfulUiActions
        .map((action) => Number(action.day_number || 0))
        .filter((day) => day > 0)
    ),
  ];
  const updatedDays = {};

  for (const dayNumber of affectedDayNumbers) {
    try {
      updatedDays[String(dayNumber)] = await planService.getPlanDay(userId, dayNumber);
    } catch (error) {
      // Ignore snapshot fetch failures; frontend can still refetch.
    }
  }

  await Promise.all([
    storeChatMessage(userId, "user", trimmedMessage),
    storeChatMessage(userId, "assistant", reply),
  ]);

  return {
    reply,
    requestsRemaining: Math.max(MAX_DAILY_CHAT_REQUESTS - (usedRequests + 1), 0),
    swapOccurred: successfulUiActions.length > 0,
    affectedDayNumbers,
    updatedDays,
  };
}

async function getLatestWeeklySummary(userId) {
  const [rows] = await pool.query(
    `SELECT id, title, body, week_key, created_at, updated_at
     FROM user_notifications
     WHERE user_id = ? AND notification_type = 'ai_weekly_summary'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function generateWeeklySummary(userId, language = "vi", options = {}) {
  const normalizedLanguage = normalizeLanguage(language);
  ensureAiIsConfigured();

  const currentWeekKey = getWeekKey();
  const [existingSummary, context] = await Promise.all([
    options.force
      ? Promise.resolve(null)
      : pool
        .query(
          `SELECT id, title, body, week_key, created_at, updated_at
             FROM user_notifications
             WHERE user_id = ?
               AND notification_type = 'ai_weekly_summary'
               AND week_key = ?
             LIMIT 1`,
          [userId, currentWeekKey]
        )
        .then(([rows]) => rows[0] || null),
    buildUserContext(userId),
  ]);

  if (existingSummary && !options.force) {
    return existingSummary;
  }

  const prompt = buildWeeklySummaryPrompt(
    normalizedLanguage,
    serializeContextForPrompt(context, normalizedLanguage)
  );

  const model = getGeminiModel([], prompt);
  const result = await model.generateContent(
    normalizedLanguage === "en"
      ? "Summarize this user's last 7 days."
      : "Hay tong ket 7 ngay gan nhat cua nguoi dung nay."
  );

  const summaryText =
    extractGeminiText(result) ||
    (normalizedLanguage === "en"
      ? "This week was recorded, but the AI summary is currently unavailable."
      : "Tuan nay da duoc ghi nhan, nhung phan nhan xet AI tam thoi chua tao duoc.");

  const title =
    normalizedLanguage === "en" ? "AI Weekly Coach Note" : "Nhan xet cua AI tuan nay";

  await pool.query(
    `INSERT INTO user_notifications
     (user_id, notification_type, title, body, week_key)
     VALUES (?, 'ai_weekly_summary', ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       body = VALUES(body),
       updated_at = CURRENT_TIMESTAMP`,
    [userId, title, summaryText, currentWeekKey]
  );
  await storeUsage(userId, "weekly_summary");

  return getLatestWeeklySummary(userId);
}

async function runWeeklySummaryForAllActiveUsers() {
  if (!process.env.GEMINI_API_KEY) {
    return;
  }

  const [rows] = await pool.query(
    `SELECT DISTINCT user_id
     FROM plans
     WHERE status = 'active'`
  );

  for (const row of rows) {
    try {
      await generateWeeklySummary(row.user_id, "vi", { force: true });
    } catch (error) {
      console.error(
        `Failed to generate AI weekly summary for user ${row.user_id}:`,
        error.message
      );
    }
  }
}

module.exports = {
  MAX_DAILY_CHAT_REQUESTS,
  chatWithAssistant,
  getLatestWeeklySummary,
  generateWeeklySummary,
  runWeeklySummaryForAllActiveUsers,
  getUnavailableMessage,
  getChatLimitError,
  getRecentChatHistory,
  clearChatHistory,
  getRemainingRequestsToday,
};
