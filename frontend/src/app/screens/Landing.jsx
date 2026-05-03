import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Award,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/fig/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useLanguage } from "../LanguageContext";

export function Landing() {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const content = useMemo(() => {
    if (language === "en") {
      return {
        brand: "HealthBudget",
        nav: {
          features: "Features",
          howItWorks: "How it works",
          pricing: "Pricing",
          login: "Sign in",
          start: "Start free",
        },
        hero: {
          badge: "Smart health planning",
          titleStart: "Reach your weight goal within",
          titleAccent: "your budget",
          description:
            "A complete 30-day plan with meals, workouts, and daily habits optimized for your health goals and spending limits.",
          primaryCta: "Start your journey",
          secondaryCta: "View demo",
          noCard: "No credit card required",
          cancel: "Cancel anytime",
          savingsLabel: "Average savings",
          savingsValue: "2.5M/month",
        },
        stats: [
          ["50K+", "Trusted users"],
          ["95%", "Reach their goals"],
          ["30 days", "To build habits"],
          ["4.9/5", "User rating"],
        ],
        featuresTitle: "Everything you need to succeed",
        featuresSubtitle: "A practical combination of health and budget control",
        features: [
          {
            icon: Target,
            gradient: "from-teal-500 to-teal-600",
            title: "Personalized goals",
            description:
              "Enter your current weight, target, and budget. The system generates a 30-day plan that fits your needs and your wallet.",
          },
          {
            icon: Wallet,
            gradient: "from-purple-500 to-purple-600",
            title: "Smart budget management",
            description:
              "Budget is allocated automatically for meals, workouts, and wellness habits. Track real spending and get alerts before you overspend.",
          },
          {
            icon: Calendar,
            gradient: "from-teal-500 to-purple-600",
            title: "Detailed 30-day plan",
            description:
              "Daily meals, workouts, sleep, and hydration targets are prepared in advance so execution is straightforward.",
          },
          {
            icon: Award,
            gradient: "from-purple-500 to-teal-500",
            title: "Reward system",
            description:
              "Complete habits, unlock achievements, earn points, and redeem health-related rewards.",
          },
        ],
        howTitle: "How it works",
        howSubtitle: "Three simple steps to get started",
        steps: [
          {
            step: "1",
            gradient: "from-teal-500 to-teal-600",
            title: "Set your goal",
            description:
              "Enter your current metrics, your target, your monthly budget, and your preferred duration.",
            image:
              "https://images.unsplash.com/photo-1485727749690-d091e8284ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMHBlcnNvbnxlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
          },
          {
            step: "2",
            gradient: "from-purple-500 to-purple-600",
            title: "Get your plan",
            description:
              "AI builds a 30-day schedule with meal suggestions, workouts, and spending guidance for each day.",
            image:
              "https://images.unsplash.com/photo-1609915437515-9d0f0166b537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
          },
          {
            step: "3",
            gradient: "from-teal-500 to-purple-600",
            title: "Track your progress",
            description:
              "Check in every day, monitor weight and spending, and keep momentum with badges and rewards.",
            image:
              "https://images.unsplash.com/photo-1764231467860-aaa2a307ec56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBzYXZpbmdzJTIwbW9uZXklMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
          },
        ],
        pricingTitle: "Simple pricing",
        pricingSubtitle: "Choose the plan that fits your needs",
        pricing: [
          {
            title: "Free",
            subtitle: "Basic trial",
            price: "0đ",
            button: "Start free",
            variant: "outline",
            features: ["30-day plan", "Basic meals", "Weight tracking"],
          },
          {
            title: "Pro",
            subtitle: "For serious users",
            price: "199.000đ",
            button: "Get started",
            popular: "Most popular",
            features: [
              "Unlimited 30-day plans",
              "Custom meals and workouts",
              "Detailed budget analysis",
              "Full rewards system",
              "Priority support",
            ],
          },
          {
            title: "Premium",
            subtitle: "Full solution",
            price: "499.000đ",
            button: "Contact sales",
            variant: "outline",
            features: [
              "Everything in Pro",
              "1-on-1 coaching",
              "Family plan",
              "Monthly health reports",
              "Partner-only offers",
            ],
          },
        ],
        testimonialsTitle: "What users say about us",
        testimonialsSubtitle: "More than 50,000 people are changing their lives",
        testimonials: [
          {
            name: "Nguyen Minh Anh",
            role: "Office worker",
            quote:
              "I lost 8kg in 30 days and saved around 3 million VND compared with my old routine.",
            avatar: "from-teal-400 to-teal-600",
          },
          {
            name: "Tran Quoc Bao",
            role: "Student",
            quote:
              "The meal plan fits a student budget very well. I can eat healthier without overspending.",
            avatar: "from-purple-400 to-purple-600",
          },
          {
            name: "Le Thu Hang",
            role: "Mother",
            quote:
              "HealthBudget gave me a clear structure and enough motivation to stay consistent every day.",
            avatar: "from-teal-400 to-purple-600",
          },
        ],
        cta: {
          title: "Ready to start your journey?",
          subtitle: "Join 50,000+ users improving their health and budget",
          button: "Start free now",
          note: "No credit card required • Cancel anytime",
        },
        footer: {
          description: "Smart health planning within your budget.",
          groups: [
            {
              title: "Product",
              items: ["Features", "Pricing", "Success stories", "Blog"],
            },
            {
              title: "Company",
              items: ["About", "Careers", "Contact", "Partners"],
            },
            {
              title: "Support",
              items: ["Help center", "Terms", "Privacy policy", "FAQ"],
            },
          ],
          copyright: "© 2026 HealthBudget. All rights reserved.",
        },
        demoTitle: "HealthBudget app demo",
        demoCounter: (current, total) => `${current} / ${total}`,
        demoCta: {
          title: "Ready to start?",
          subtitle: "Create your 30-day plan today",
          button: "Start free",
          prev: "Previous",
          next: "Next",
        },
        demoSlides: [
          {
            title: "Dashboard - complete overview",
            description:
              "Track weight progress, spending, and daily habit completion. View key charts and metrics in one place.",
            image:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzc3MTg4MDY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
            features: [
              "Weight chart over time",
              "Spending vs budget",
              "Habit completion streaks",
              "Recent achievements",
            ],
          },
          {
            title: "Detailed 30-day plan",
            description:
              "See a full month of meals, workouts, sleep, and hydration targets optimized for your goals and budget.",
            image:
              "https://images.unsplash.com/photo-1766596737206-214abffe65bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            features: [
              "Calendar and list views",
              "Daily budget allocation",
              "3-6 meals per day",
              "Personalized workout schedule",
            ],
          },
          {
            title: "Daily routine details",
            description:
              "Use a checklist for meals, workouts, sleep, and hydration. Complete tasks and keep momentum.",
            image:
              "https://images.unsplash.com/photo-1609915437515-9d0f0166b537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            features: [
              "Meal breakdown by time of day",
              "Detailed cooking guidance",
              "Workout instructions",
              "Hydration reminders",
            ],
          },
          {
            title: "Progress tracking",
            description:
              "Log real weight and daily spending. Compare trends against your target and adjust early.",
            image:
              "https://images.unsplash.com/photo-1485727749690-d091e8284ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMHBlcnNvbnxlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
            features: [
              "Weight chart",
              "Expense tracking",
              "Trend insights",
              "Budget overrun alerts",
            ],
          },
          {
            title: "Reward system",
            description:
              "Unlock achievements, collect points, and claim vouchers to reinforce consistency.",
            image:
              "https://images.unsplash.com/photo-1764231467860-aaa2a307ec56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBzYXZpbmdzJTIwbW9uZXklMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
            features: [
              "50+ achievement types",
              "Accumulated reward points",
              "Partner vouchers",
              "More motivation to stay consistent",
            ],
          },
        ],
      };
    }

    return {
      brand: "HealthBudget",
      nav: {
        features: "Tính năng",
        howItWorks: "Cách hoạt động",
        pricing: "Bảng giá",
        login: "Đăng nhập",
        start: "Bắt đầu miễn phí",
      },
      hero: {
        badge: "Quản lý sức khỏe thông minh",
        titleStart: "Đạt mục tiêu cân nặng trong",
        titleAccent: "ngân sách của bạn",
        description:
          "Kế hoạch 30 ngày toàn diện với bữa ăn, tập luyện và thói quen hàng ngày, được tối ưu hóa cho mục tiêu sức khỏe và ví tiền của bạn.",
        primaryCta: "Bắt đầu hành trình",
        secondaryCta: "Xem demo",
        noCard: "Không cần thẻ tín dụng",
        cancel: "Hủy bất cứ lúc nào",
        savingsLabel: "Tiết kiệm trung bình",
        savingsValue: "2.5 triệu/tháng",
      },
      stats: [
        ["50K+", "Người dùng tin tưởng"],
        ["95%", "Đạt mục tiêu"],
        ["30 ngày", "Thay đổi thói quen"],
        ["4.9/5", "Đánh giá người dùng"],
      ],
      featuresTitle: "Mọi thứ bạn cần để thành công",
      featuresSubtitle: "Kết hợp hoàn hảo giữa sức khỏe và tài chính",
      features: [
        {
          icon: Target,
          gradient: "from-teal-500 to-teal-600",
          title: "Mục tiêu cá nhân hóa",
          description:
            "Nhập cân nặng hiện tại, mục tiêu và ngân sách. Hệ thống AI sẽ tạo kế hoạch 30 ngày phù hợp với nhu cầu và khả năng chi trả của bạn.",
        },
        {
          icon: Wallet,
          gradient: "from-purple-500 to-purple-600",
          title: "Quản lý ngân sách thông minh",
          description:
            "Phân bổ ngân sách tự động cho bữa ăn, tập luyện và thói quen khác. Theo dõi chi tiêu thực tế và nhận cảnh báo khi vượt quá giới hạn.",
        },
        {
          icon: Calendar,
          gradient: "from-teal-500 to-purple-600",
          title: "Kế hoạch 30 ngày chi tiết",
          description:
            "Thực đơn hàng ngày, lịch tập luyện, giờ ngủ và lượng nước uống. Mọi thứ đã được lên lịch sẵn cho bạn.",
        },
        {
          icon: Award,
          gradient: "from-purple-500 to-teal-500",
          title: "Hệ thống phần thưởng",
          description:
            "Hoàn thành thói quen để mở khóa thành tích, tích điểm và nhận voucher giảm giá cho các sản phẩm sức khỏe.",
        },
      ],
      howTitle: "Cách hoạt động",
      howSubtitle: "Chỉ 3 bước đơn giản để bắt đầu hành trình của bạn",
      steps: [
        {
          step: "1",
          gradient: "from-teal-500 to-teal-600",
          title: "Thiết lập mục tiêu",
          description:
            "Nhập thông tin cơ bản: cân nặng hiện tại, mục tiêu, ngân sách và thời gian mong muốn.",
          image:
            "https://images.unsplash.com/photo-1485727749690-d091e8284ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMHBlcnNvbnxlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        },
        {
          step: "2",
          gradient: "from-purple-500 to-purple-600",
          title: "Nhận kế hoạch",
          description:
            "AI tạo kế hoạch 30 ngày với thực đơn, bài tập và ngân sách chi tiết cho từng ngày.",
          image:
            "https://images.unsplash.com/photo-1609915437515-9d0f0166b537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        },
        {
          step: "3",
          gradient: "from-teal-500 to-purple-600",
          title: "Theo dõi tiến độ",
          description:
            "Check-in hàng ngày, theo dõi cân nặng và chi tiêu. Nhận phần thưởng khi đạt mục tiêu.",
          image:
            "https://images.unsplash.com/photo-1764231467860-aaa2a307ec56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBzYXZpbmdzJTIwbW9uZXklMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        },
      ],
      pricingTitle: "Bảng giá đơn giản",
      pricingSubtitle: "Chọn gói phù hợp với nhu cầu của bạn",
      pricing: [
        {
          title: "Miễn phí",
          subtitle: "Dùng thử cơ bản",
          price: "0đ",
          button: "Bắt đầu miễn phí",
          variant: "outline",
          features: ["Kế hoạch 30 ngày", "Thực đơn cơ bản", "Theo dõi cân nặng"],
        },
        {
          title: "Pro",
          subtitle: "Cho người nghiêm túc",
          price: "199.000đ",
          button: "Bắt đầu ngay",
          popular: "Phổ biến nhất",
          features: [
            "Kế hoạch 30 ngày không giới hạn",
            "Thực đơn và bài tập tùy chỉnh",
            "Phân tích ngân sách chi tiết",
            "Hệ thống phần thưởng đầy đủ",
            "Hỗ trợ ưu tiên",
          ],
        },
        {
          title: "Premium",
          subtitle: "Giải pháp toàn diện",
          price: "499.000đ",
          button: "Liên hệ tư vấn",
          variant: "outline",
          features: [
            "Mọi tính năng Pro",
            "Tư vấn 1-1 với chuyên gia",
            "Kế hoạch gia đình",
            "Báo cáo sức khỏe hàng tháng",
            "Ưu đãi từ đối tác",
          ],
        },
      ],
      testimonialsTitle: "Người dùng nói gì về chúng tôi",
      testimonialsSubtitle: "Hơn 50,000 người đã thay đổi cuộc sống của họ",
      testimonials: [
        {
          name: "Nguyễn Minh Anh",
          role: "Nhân viên văn phòng",
          quote:
            "Tôi đã giảm được 8kg trong 30 ngày và tiết kiệm được 3 triệu đồng so với trước.",
          avatar: "from-teal-400 to-teal-600",
        },
        {
          name: "Trần Quốc Bảo",
          role: "Sinh viên",
          quote:
            "Kế hoạch ăn uống rất phù hợp với ngân sách sinh viên của mình. Mình vừa ăn healthy vừa không lo vượt chi.",
          avatar: "from-purple-400 to-purple-600",
        },
        {
          name: "Lê Thu Hằng",
          role: "Mẹ bỉm sữa",
          quote:
            "HealthBudget giúp tôi có kế hoạch rõ ràng và động lực để kiên trì mỗi ngày.",
          avatar: "from-teal-400 to-purple-600",
        },
      ],
      cta: {
        title: "Sẵn sàng bắt đầu hành trình của bạn?",
        subtitle: "Tham gia cùng 50,000+ người đang thay đổi cuộc sống của họ",
        button: "Bắt đầu miễn phí ngay",
        note: "Không cần thẻ tín dụng • Hủy bất cứ lúc nào",
      },
      footer: {
        description: "Quản lý sức khỏe thông minh trong ngân sách của bạn.",
        groups: [
          {
            title: "Sản phẩm",
            items: ["Tính năng", "Bảng giá", "Câu chuyện thành công", "Blog"],
          },
          {
            title: "Công ty",
            items: ["Về chúng tôi", "Tuyển dụng", "Liên hệ", "Đối tác"],
          },
          {
            title: "Hỗ trợ",
            items: ["Trung tâm trợ giúp", "Điều khoản sử dụng", "Chính sách bảo mật", "FAQ"],
          },
        ],
        copyright: "© 2026 HealthBudget. All rights reserved.",
      },
      demoTitle: "Demo ứng dụng HealthBudget",
      demoCounter: (current, total) => `${current} / ${total}`,
      demoCta: {
        title: "Sẵn sàng bắt đầu?",
        subtitle: "Tạo kế hoạch 30 ngày của bạn ngay hôm nay",
        button: "Bắt đầu miễn phí",
        prev: "Trước",
        next: "Tiếp",
      },
      demoSlides: [
        {
          title: "Dashboard - Tổng quan toàn diện",
          description:
            "Theo dõi tiến độ cân nặng, chi tiêu, và hoàn thành thói quen hàng ngày. Xem biểu đồ trực quan và các metrics quan trọng ở một nơi.",
          image:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxkYXNoYm9hcmQlMjBhbmFseXRpY3MlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MXx8fHwxNzc3MTg4MDY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
          features: [
            "Biểu đồ cân nặng theo thời gian",
            "Chi tiêu và ngân sách",
            "Streak hoàn thành thói quen",
            "Thành tích gần đây",
          ],
        },
        {
          title: "Kế hoạch 30 ngày chi tiết",
          description:
            "Xem lịch trình đầy đủ cho 30 ngày với view lịch hoặc danh sách. Mỗi ngày có thực đơn, bài tập, giờ ngủ và mục tiêu nước uống được tối ưu cho ngân sách.",
          image:
            "https://images.unsplash.com/photo-1766596737206-214abffe65bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
          features: [
            "View lịch và danh sách",
            "Phân bổ ngân sách hàng ngày",
            "Thực đơn 3-6 bữa/ngày",
            "Lịch tập luyện cá nhân hóa",
          ],
        },
        {
          title: "Chi tiết thói quen hàng ngày",
          description:
            "Checklist đầy đủ cho từng ngày với meal breakdown, bài tập chi tiết, giờ ngủ và lượng nước. Tick hoàn thành để tích điểm.",
          image:
            "https://images.unsplash.com/photo-1609915437515-9d0f0166b537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
          features: [
            "Meal breakdown theo bữa",
            "Công thức nấu ăn chi tiết",
            "Hướng dẫn tập luyện",
            "Nhắc nhở uống nước",
          ],
        },
        {
          title: "Theo dõi tiến độ",
          description:
            "Nhập cân nặng và chi tiêu thực tế hàng ngày. Xem biểu đồ xu hướng, so sánh với mục tiêu, và nhận insights để điều chỉnh kế hoạch.",
          image:
            "https://images.unsplash.com/photo-1485727749690-d091e8284ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMHBlcnNvbnxlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
          features: [
            "Biểu đồ cân nặng",
            "Theo dõi chi tiêu",
            "Phân tích xu hướng",
            "Cảnh báo vượt ngân sách",
          ],
        },
        {
          title: "Hệ thống phần thưởng",
          description:
            "Mở khóa thành tích, tích điểm và nhận voucher giảm giá cho sản phẩm sức khỏe. Động lực để bạn kiên trì với kế hoạch.",
          image:
            "https://images.unsplash.com/photo-1764231467860-aaa2a307ec56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWRnZXQlMjBzYXZpbmdzJTIwbW9uZXklMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
          features: [
            "50+ thành tích đa dạng",
            "Điểm thưởng tích lũy",
            "Voucher từ đối tác",
            "Động lực duy trì kế hoạch",
          ],
        },
      ],
    };
  }, [language]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % content.demoSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + content.demoSlides.length) % content.demoSlides.length,
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 lg:px-16">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
              {content.brand}
            </h1>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              {content.nav.features}
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              {content.nav.howItWorks}
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              {content.nav.pricing}
            </a>
            <Link to="/login">
              <Button variant="ghost">{content.nav.login}</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                {content.nav.start}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-purple-50 to-white">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-16 lg:py-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-teal-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">{content.hero.badge}</span>
              </div>
              <h2 className="mb-6 text-5xl font-bold leading-tight lg:text-6xl">
                {content.hero.titleStart}
                <span className="bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  {content.hero.titleAccent}
                </span>
              </h2>
              <p className="mb-8 text-xl leading-relaxed text-gray-600">
                {content.hero.description}
              </p>
              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-purple-600 px-8 py-6 text-lg hover:from-teal-600 hover:to-purple-700"
                  >
                    {content.hero.primaryCta}
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg"
                  onClick={() => setIsModalOpen(true)}
                >
                  {content.hero.secondaryCta}
                </Button>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">{content.hero.noCard}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">{content.hero.cancel}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758523420914-34c82b27a023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoZWFsdGh5JTIwbWVhbCUyMHByZXAlMjBwbGFubmluZ3xlbnwxfHx8fDE3NzcxODc1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Healthy meal planning"
                  className="h-[600px] w-full object-cover"
                />
              </div>
              <Card className="absolute -bottom-8 -left-4 bg-white p-6 shadow-xl lg:-left-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{content.hero.savingsLabel}</p>
                    <p className="text-2xl font-bold text-gray-900">{content.hero.savingsValue}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {content.stats.map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="mb-2 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent">
                  {value}
                </p>
                <p className="text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-5xl font-bold">{content.featuresTitle}</h3>
            <p className="text-xl text-gray-600">{content.featuresSubtitle}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {content.features.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-8 transition-shadow hover:shadow-lg">
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient}`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="mb-3 text-2xl font-bold">{item.title}</h4>
                  <p className="leading-relaxed text-gray-600">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-gradient-to-br from-gray-50 to-white py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-5xl font-bold">{content.howTitle}</h3>
            <p className="text-xl text-gray-600">{content.howSubtitle}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {content.steps.map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} shadow-lg`}
                >
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="h-64 w-full object-cover"
                  />
                </div>
                <h4 className="mb-3 text-2xl font-bold">{item.title}</h4>
                <p className="leading-relaxed text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-5xl font-bold">{content.pricingTitle}</h3>
            <p className="text-xl text-gray-600">{content.pricingSubtitle}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {content.pricing.map((plan) => (
              <Card
                key={plan.title}
                className={`relative p-8 transition-shadow hover:shadow-lg ${
                  plan.popular ? "border-2 border-teal-500 hover:shadow-xl" : ""
                }`}
              >
                {plan.popular ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 px-4 py-1 text-sm font-medium text-white">
                    {plan.popular}
                  </div>
                ) : null}
                <h4 className="mb-2 text-2xl font-bold">{plan.title}</h4>
                <p className="mb-6 text-gray-600">{plan.subtitle}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/tháng</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button
                    variant={plan.variant === "outline" ? "outline" : "default"}
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                        : ""
                    }`}
                  >
                    {plan.button}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-50 to-purple-50 py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-5xl font-bold">{content.testimonialsTitle}</h3>
            <p className="text-xl text-gray-600">{content.testimonialsSubtitle}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {content.testimonials.map((item) => (
              <Card key={item.name} className="p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="text-xl text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-gray-700">"{item.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${item.avatar}`} />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-teal-600 to-purple-600 py-24">
        <div className="mx-auto max-w-[1440px] px-6 text-center lg:px-16">
          <h3 className="mb-6 text-5xl font-bold text-white">{content.cta.title}</h3>
          <p className="mb-8 text-xl text-teal-50">{content.cta.subtitle}</p>
          <Link to="/register">
            <Button size="lg" className="bg-white px-12 py-6 text-lg text-teal-600 hover:bg-gray-100">
              {content.cta.button}
            </Button>
          </Link>
          <p className="mt-4 text-teal-50">{content.cta.note}</p>
        </div>
      </section>

      <footer className="bg-gray-900 py-16 text-gray-300">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-16">
          <div className="mb-12 grid gap-12 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-purple-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">{content.brand}</h1>
              </div>
              <p className="leading-relaxed text-gray-400">{content.footer.description}</p>
            </div>
            {content.footer.groups.map((group) => (
              <div key={group.title}>
                <h5 className="mb-4 font-semibold text-white">{group.title}</h5>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <a href="#" className="hover:text-white">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400">{content.footer.copyright}</p>
          </div>
        </div>
      </footer>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              {content.demoTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            <div className="mb-6">
              <div className="relative mb-6 h-96 overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={content.demoSlides[currentSlide].image}
                  alt={content.demoSlides[currentSlide].title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="mb-2 text-3xl font-bold">
                    {content.demoSlides[currentSlide].title}
                  </h3>
                  <p className="text-lg text-gray-100">
                    {content.demoSlides[currentSlide].description}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid gap-3 md:grid-cols-2">
                {content.demoSlides[currentSlide].features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-teal-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" size="lg" onClick={prevSlide} className="flex items-center gap-2">
                <ChevronLeft className="h-5 w-5" />
                {content.demoCta.prev}
              </Button>

              <div className="flex gap-2">
                {content.demoSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-gradient-to-r from-teal-500 to-purple-600"
                        : "w-3 bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button variant="outline" size="lg" onClick={nextSlide} className="flex items-center gap-2">
                {content.demoCta.next}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <p className="mt-4 text-center text-gray-600">
              {content.demoCounter(currentSlide + 1, content.demoSlides.length)}
            </p>

            <div className="mt-8 rounded-2xl bg-gradient-to-r from-teal-50 to-purple-50 p-6 text-center">
              <h4 className="mb-2 text-2xl font-bold">{content.demoCta.title}</h4>
              <p className="mb-4 text-gray-600">{content.demoCta.subtitle}</p>
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  {content.demoCta.button}
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
