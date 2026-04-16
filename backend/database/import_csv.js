//npm install csv-parser
//sau khi tạo execute file sql 006 quay lại cmd chạy: node database/import_csv.js

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const pool = require('../src/config/db');

function splitCSV(line) {
  return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.replace(/^"|"$/g, '').trim());
}

async function importMeals() {
  console.log("🚀 Đang import dữ liệu Meal Library...");
  const filePath = path.join(__dirname, '../../meal_library_import.csv');
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isFirst = true;
  let count = 0;
  for await (const line of rl) {
    if (isFirst) { isFirst = false; continue; } // Bỏ qua Header
    if (!line.trim()) continue;

    const data = splitCSV(line);
    const [meal_name, meal_type, budget_tier, goal_type, calories, estimated_cost, is_active] = data;

    await pool.query(
      `INSERT INTO meal_library (meal_name, meal_type, budget_tier, goal_type, calories, estimated_cost, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [meal_name, meal_type, budget_tier, goal_type, Number(calories), Number(estimated_cost), Number(is_active)]
    );
    count++;
  }
  console.log(`✅ Import thành công ${count} món ăn.`);
}

async function importWorkouts() {
  console.log("🚀 Đang import dữ liệu Workout Library...");
  const filePath = path.join(__dirname, '../../workout_library_import.csv');
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isFirst = true;
  let count = 0;
  for await (const line of rl) {
    if (isFirst) { isFirst = false; continue; }
    if (!line.trim()) continue;

    const data = splitCSV(line);
    const [workout_type, gender_target, location, workout_name, primary_focus, equipment, difficulty, suggested_volume, notes, is_active] = data;

    await pool.query(
      `INSERT INTO workout_library 
            (workout_type, gender_target, location, workout_name, primary_focus, equipment, difficulty, suggested_volume, notes, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [workout_type, gender_target, location, workout_name, primary_focus, equipment, difficulty, suggested_volume, notes, Number(is_active)]
    );
    count++;
  }
  console.log(`✅ Import thành công ${count} bài tập.`);
}

async function main() {
  try {
    console.log("Bắt đầu xử lý import CSV bằng hệ thống script Node.js...");
    await importMeals();
    await importWorkouts();
    console.log("🎉 Hoàn tất toàn bộ quy trình import!");
  } catch (err) {
    console.error("❌ Lỗi trong quá trình import:", err);
  } finally {
    await pool.end();
  }
}

main();
