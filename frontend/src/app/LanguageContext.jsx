import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "budgetfit-language";

const TRANSLATIONS = [
  ["Ngôn ngữ", "Language"],
  ["Tiếng Việt", "Vietnamese"],
  ["English", "English"],
  ["Tổng quan", "Dashboard"],
  ["Kế hoạch", "Plan"],
  ["Theo dõi", "Tracking"],
  ["Phần thưởng", "Rewards"],
  ["Cài đặt", "Settings"],
  ["Đăng xuất", "Log out"],
  ["Người dùng BudgetFit", "BudgetFit user"],
  ["Sức khỏe và ngân sách", "Health and budget"],
  ["Kế hoạch 30 ngày", "30-Day Plan"],
  ["Theo dõi tiến độ và bám sát mục tiêu của bạn", "Track progress and stay aligned with your goals"],
  ["Cân nặng hiện tại", "Current weight"],
  ["Cân nặng mục tiêu", "Goal weight"],
  ["Tiến độ mục tiêu", "Goal progress"],
  ["Mức bám sát tuần", "Weekly adherence"],
  ["Ngân sách đã dùng", "Budget used"],
  ["Chưa có dữ liệu", "No data yet"],
  ["Hoàn thành onboarding trước", "Complete onboarding first"],
  ["Tiến độ cân nặng", "Weight progress"],
  ["Cân nặng của bạn theo thời gian", "Your weight over time"],
  ["Chi tiêu so với ngân sách", "Spending vs budget"],
  ["Xem chi tiết", "View details"],
  ["Ban đầu", "Start"],
  ["Hiện tại", "Current"],
  ["Mục tiêu", "Goal"],
  ["Tổng đã chi", "Total spent"],
  ["TB mỗi tuần", "Avg weekly"],
  ["Còn lại", "Remaining"],
  ["Đã chi", "Spent"],
  ["Ngân sách", "Budget"],
  ["Bạn chưa có dữ liệu biểu đồ.", "You do not have chart data yet."],
  ["Bấm vào đây để khai báo theo dõi và xem biểu đồ tiến độ.", "Go to tracking to add data and view progress charts."],
  ["Đến trang theo dõi", "Go to Tracking"],
  ["Nhật ký cân nặng", "Weight log"],
  ["Nhật ký chi tiêu", "Expense log"],
  ["Theo dõi tiến độ cân nặng và chi tiêu của bạn", "Track your weight progress and spending"],
  ["Hãy cập nhật cân nặng của bạn mỗi tuần", "Update your weight every week"],
  ["Ghi nhận đều đặn giúp hệ thống theo dõi tiến độ và điều chỉnh kế hoạch chính xác hơn.", "Regular updates help the system track progress and adjust your plan more accurately."],
  ["Tất cả", "All"],
  ["Tuần này", "This week"],
  ["Tháng này", "This month"],
  ["Trước", "Previous"],
  ["Sau", "Next"],
  ["Thêm bản ghi", "Add log"],
  ["Ngày", "Date"],
  ["Cân nặng (kg)", "Weight (kg)"],
  ["Ghi chú (tùy chọn)", "Note (optional)"],
  ["Lưu", "Save"],
  ["Cập nhật", "Update"],
  ["Đang lưu...", "Saving..."],
  ["Đang lấy dữ liệu...", "Loading data..."],
  ["Bạn chưa ghi nhận cân nặng nào. Hãy thêm mới ngay!", "You have not logged any weight yet. Add one now!"],
  ["Bạn chưa ghi nhận chi tiêu nào. Hãy thêm mới ngay!", "You have not logged any expenses yet. Add one now!"],
  ["Số tiền", "Amount"],
  ["Mô tả (tùy chọn)", "Description (optional)"],
  ["Chi tiêu tuần", "Weekly spending"],
  ["Dữ liệu từ hệ thống", "System data"],
  ["Kế hoạch hiện tại", "Current plan"],
  ["Tháng trước", "Previous month"],
  ["Tháng sau", "Next month"],
  ["Lưới", "Grid"],
  ["Danh sách", "List"],
  ["Bỏ qua", "Skipped"],
  ["Đã hoàn thành", "Completed"],
  ["Chi phí food dự kiến", "Planned food cost"],
  ["Loại bài tập", "Workout type"],
  ["Tạo lại kế hoạch", "Regenerate plan"],
  ["Tiếp tục kế hoạch", "Continue plan"],
  ["Không có ngày kế hoạch nào trong tháng này.", "No plan days in this month."],
  ["Ngày này đã hoàn thành. Bạn có thể xem lại nhiệm vụ nhưng không thể chỉnh sửa.", "This day is completed. You can review tasks but cannot edit them."],
  ["Ngày này đã bị khóa, bạn chỉ có thể xem lại tiến độ.", "This day is locked. You can only review progress."],
  ["Chỉ xem lại nhiệm vụ", "Review tasks only"],
  ["Ngày này đã bị khóa", "This day is locked"],
  ["Kế hoạch dinh dưỡng", "Nutrition plan"],
  ["Bữa sáng", "Breakfast"],
  ["Bữa trưa", "Lunch"],
  ["Bữa tối", "Dinner"],
  ["Bữa phụ", "Snacks"],
  ["Tập luyện", "Workout"],
  ["Giấc ngủ", "Sleep"],
  ["Uống nước", "Water"],
  ["Calo dự kiến", "Planned calories"],
  ["Chi phí dự kiến", "Planned cost"],
  ["Tiến độ trong ngày", "Daily progress"],
  ["Nhiệm vụ đã hoàn thành", "Tasks completed"],
  ["Thực chi", "Actual spent"],
  ["Tiết kiệm", "Saved"],
  ["Vượt", "Over by"],
  ["so với kế hoạch", "compared with plan"],
  ["Chi phí thực tế hôm nay", "Today's actual cost"],
  ["Bạn đã chi bao nhiêu?", "How much did you actually spend?"],
  ["Nhập chi phí thực tế", "Enter actual cost"],
  ["Lưu chi phí", "Save cost"],
  ["Hủy", "Cancel"],
  ["Lưu và quay lại kế hoạch", "Save and return to plan"],
  ["Đã hoàn thành ngày này!", "Day completed!"],
  ["Tổng", "Total"],
  ["phút", "min"],
  ["ly", "glasses"],
  ["Kế hoạch ngân sách", "Budget plan"],
  ["Phân bổ ngân sách", "Budget breakdown"],
  ["Ngân sách mỗi ngày", "Daily budget"],
  ["Tổng ngân sách", "Total budget"],
  ["Đồ ăn", "Food"],
  ["Tập luyện", "Workout"],
  ["Chăm sóc sức khỏe", "Wellness"],
  ["Dự phòng", "Buffer"],
  ["Phân thưởng", "Rewards"],
  ["Điểm thưởng", "Reward points"],
  ["Thành tựu", "Achievements"],
  ["Đổi thưởng", "Redeem"],
  ["Đã nhận", "Claimed"],
  ["Xác nhận đổi voucher", "Confirm voucher claim"],
  ["Đóng", "Close"],
  ["Nhận", "Claim"],
  ["Cơ thể & mục tiêu", "Body & goals"],
  ["Ngân sách & tùy chọn", "Budget & preferences"],
  ["Thông báo", "Notifications"],
  ["Bảo mật", "Security"],
  ["Đổi mật khẩu", "Change password"],
  ["Trở lại cuộc đua 30 ngày", "Return to the 30-day race"],
  ["Tuổi", "Age"],
  ["Chiều cao", "Height"],
  ["Cân nặng", "Weight"],
  ["Giới tính", "Gender"],
  ["Nam", "Male"],
  ["Nữ", "Female"],
  ["Khác", "Other"],
  ["Giảm cân", "Lose weight"],
  ["Giữ cân", "Maintain"],
  ["Tăng cân", "Gain weight"],
  ["Thời lượng", "Duration"],
  ["Ngân sách tháng", "Monthly budget"],
  ["Địa điểm tập", "Workout location"],
  ["Tập ở nhà", "Home workouts"],
  ["Tập ở gym", "Gym workouts"],
  ["Số bữa mỗi ngày", "Meals per day"],
  ["Phong cách ngân sách", "Budget style"],
  ["Tiết kiệm", "Saving"],
  ["Bình thường", "Normal"],
  ["Cao cấp", "Premium"],
  ["Đã lưu chỉ số cơ thể và mục tiêu.", "Body metrics and goals saved."],
  ["Đã lưu ngân sách và tùy chọn.", "Budget and preferences saved."],
  ["Đã đổi mật khẩu thành công.", "Password changed successfully."],
  ["Mật khẩu cũ", "Current password"],
  ["Mật khẩu mới", "New password"],
  ["Xác nhận mật khẩu mới", "Confirm new password"],
  ["Đăng nhập", "Sign in"],
  ["Đăng ký", "Sign up"],
  ["Quên mật khẩu?", "Forgot password?"],
  ["Ghi nhớ đăng nhập", "Remember me"],
  ["Bạn chưa có tài khoản?", "Do not have an account?"],
  ["Bạn đã có tài khoản?", "Already have an account?"],
  ["Địa chỉ email", "Email address"],
  ["Mật khẩu", "Password"],
  ["Họ và tên", "Full name"],
  ["Xác nhận mật khẩu", "Confirm password"],
  ["Đặt lại mật khẩu", "Reset password"],
  ["Gửi liên kết đặt lại", "Send reset link"],
  ["Quay lại đăng nhập", "Back to login"],
  ["Lịch ăn uống và tập luyện cá nhân hóa theo thời gian thực tế", "Personalized meal and workout schedule based on real dates"],
  ["Lịch", "Calendar"],
  ["Ngày đã hoàn thành", "Completed days"],
  ["Chuỗi hiện tại", "Current streak"],
  ["Dựa trên số ngày đã hoàn thành", "Based on completed days"],
  ["Ngân sách TB/ngày", "Avg daily budget"],
  ["Trạng thái ngân sách", "Budget status"],
  ["Đang hoạt động", "Active"],
  ["Đang chờ", "Pending"],
  ["Tạo kế hoạch ở bước onboarding", "Create a plan during onboarding"],
  ["Bạn đã hoàn thành kế hoạch 30 ngày", "You have completed the 30-day plan"],
  ["Bạn đã hoàn thành kế hoạch", "You have completed the plan"],
  ["Tổng kết kế hoạch", "Plan summary"],
  ["Bạn đã đi tới ngày cuối cùng của chu kỳ hiện tại. Một vài ngày có thể bị bỏ qua, nhưng hệ thống vẫn tổng kết dựa trên những gì bạn đã thực hiện.", "You reached the final day of the current cycle. Some days may have been skipped, but the system still summarizes what you completed."],
  ["Ngày đã bỏ qua", "Skipped days"],
  ["Bạn có muốn tiếp tục thêm 30 ngày nữa không? Nếu chọn có, hệ thống sẽ tạo tiếp bữa ăn và bài tập từ ngày kế tiếp sau khi kế hoạch hiện tại kết thúc.", "Do you want to continue for another 30 days? If yes, the system will generate meals and workouts from the next day after the current plan ends."],
  ["Không, giữ như hiện tại", "No, keep it as is"],
  ["Có, tiếp tục 30 ngày", "Yes, continue 30 days"],
  ["Đang xử lý...", "Processing..."],
  ["Đang tạo lại...", "Regenerating..."],
  ["Cách phân bổ ngân sách cá nhân hóa cho kế hoạch 30 ngày", "Personalized budget allocation for your 30-day plan"],
  ["Bạn đã chọn tập tại nhà: ngân sách tập luyện được đặt là 0 VND và", "You selected home workouts: workout budget is set to 0 VND and"],
  ["phân bổ lại cho ăn uống, sức khỏe và dự phòng, ưu tiên phần ăn uống.", "redistributed to food, wellness, and buffer, prioritizing food."],
  ["Phân bổ hàng tháng", "Monthly allocation"],
  ["Tóm tắt ngân sách", "Budget summary"],
  ["Tổng ngân sách hàng tháng", "Total monthly budget"],
  ["VND / tháng", "VND / month"],
  ["Trung bình/ngày", "Average/day"],
  ["Mẹo tiết kiệm ngân sách", "Budget-saving tips"],
  ["Tự nấu ăn tại nhà", "Cook at home"],
  ["Chuẩn bị bữa ăn tại nhà có thể giúp tiết kiệm tới 40% chi phí ăn uống", "Preparing meals at home can save up to 40% of food costs"],
  ["Tập luyện tại nhà", "Train at home"],
  ["Không cần thẻ phòng gym khi dùng các bài tập với trọng lượng cơ thể", "No gym membership needed when using bodyweight workouts"],
  ["Ăn uống", "Food"],
  ["Sức khỏe", "Wellness"],
  ["Phần thưởng & thành tựu", "Rewards & achievements"],
  ["Tích điểm và mở khóa các ưu đãi riêng", "Earn points and unlock exclusive offers"],
  ["Tổng điểm", "Total points"],
  ["Cấp hiện tại", "Current level"],
  ["Cấp tiếp theo", "Next level"],
  ["Tiến độ tới cấp", "Progress to level"],
  ["Thành tựu của bạn", "Your achievements"],
  ["Đổi voucher", "Redeem vouchers"],
  ["Làm mới", "Refresh"],
  ["Đổi", "Redeem"],
  ["Đang đổi...", "Redeeming..."],
  ["Đang nhận...", "Claiming..."],
  ["Lịch sử phần thưởng", "Reward history"],
  ["Chưa có lịch sử phần thưởng. Hoàn thành thành tựu hoặc đổi voucher để xem tại đây.", "No reward history yet. Complete achievements or redeem vouchers to see them here."],
  ["Đã đổi voucher", "Voucher redeemed"],
  ["Bạn có chắc muốn dùng", "Are you sure you want to use"],
  ["Nếu bấm Close, giao dịch sẽ bị hủy và voucher chưa được nhận.", "If you press Close, the transaction will be canceled and the voucher will not be claimed."],
  ["Voucher được làm mới theo tuần. Tuần sau bạn có thể đổi lại voucher này nếu còn đủ điểm và còn lượt.", "Vouchers refresh weekly. Next week you can redeem this voucher again if you have enough points and availability remains."],
  ["Xem lại và cập nhật thông tin bạn đã nhập trong onboarding", "Review and update the information you entered during onboarding"],
  ["Thông tin tài khoản", "Account information"],
  ["Thông tin tài khoản được lấy từ hệ thống đăng nhập", "Account information is pulled from the login system"],
  ["Các giá trị này được lấy từ hồ sơ onboarding của bạn", "These values come from your onboarding profile"],
  ["Dừng sửa", "Stop editing"],
  ["Sửa", "Edit"],
  ["Lưu thay đổi", "Save changes"],
  ["Ngân sách hàng tháng (VND)", "Monthly budget (VND)"],
  ["Địa điểm tập luyện", "Workout location"],
  ["Tại nhà", "Home"],
  ["Phòng gym", "Gym"],
  ["Phong cách chi tiêu", "Spending style"],
  ["Điều chỉnh các tùy chọn ngân sách dùng để tạo kế hoạch", "Adjust budget preferences used to generate your plan"],
  ["Tùy chọn sẽ được lưu vào tài khoản của bạn", "Preferences will be saved to your account"],
  ["Nhắc nhở hằng ngày", "Daily reminders"],
  ["Nhận thông báo về nhiệm vụ trong ngày", "Receive notifications about daily tasks"],
  ["Nhắc bạn ghi nhận cân nặng", "Remind you to log your weight"],
  ["Cảnh báo ngân sách", "Budget alerts"],
  ["Thông báo khi gần chạm giới hạn ngân sách", "Notify you when you are close to your budget limit"],
  ["Quản lý bảo mật tài khoản", "Manage account security"],
  ["Mật khẩu hiện tại", "Current password"],
  ["Cập nhật mật khẩu", "Update password"],
  ["Đang đổi...", "Changing..."],
  ["Xóa tài khoản", "Delete account"],
  ["Chức năng xóa tài khoản đang tắt cho đến khi có quy trình xóa an toàn.", "Account deletion is disabled until a safe deletion process is available."],
  ["Bạn đã tạm dừng sau chu kỳ trước. Bấm nút này để tạo 30 ngày mới bắt đầu từ hôm nay.", "You paused after the previous cycle. Press this button to create a new 30-day plan starting today."],
  ["Bắt đầu lại", "Start again"],
  ["Đang tạo...", "Creating..."],
  ["Thời lượng kế hoạch", "Plan duration"],
  ["Ngân sách hàng tháng", "Monthly budget"],
  ["Cân bằng", "Balanced"],
  ["Hãy cho chúng tôi biết về bạn", "Let's get to know you"],
  ["Thông tin này sẽ được dùng để tạo kế hoạch cá nhân hóa cho bạn", "We will use this information to create your personalized plan"],
  ["Thông tin cá nhân", "Personal information"],
  ["Nhập các chỉ số cơ bản của bạn", "Enter your basic metrics"],
  ["Mục tiêu của bạn là gì?", "What is your goal?"],
  ["Lập ngân sách", "Budget planning"],
  ["Thiết lập ngân sách hàng tháng cho kế hoạch này", "Set your monthly budget for this plan"],
  ["Tối thiểu 3.000.000 VND -", "Minimum 3,000,000 VND -"],
  ["Tối ưu chi phí", "Optimize costs"],
  ["Phân bổ hợp lý", "Balanced allocation"],
  ["Ngân sách ước tính mỗi ngày", "Estimated daily budget"],
  ["Sở thích của bạn", "Your preferences"],
  ["Tùy chỉnh kế hoạch theo lối sống của bạn", "Customize your plan to fit your lifestyle"],
  ["Tập tại nhà", "Home workouts"],
  ["Tập tại phòng gym", "Gym workouts"],
  ["Khuyến nghị: 3-4 bữa mỗi ngày", "Recommended: 3-4 meals per day"],
  ["Sẵn sàng bắt đầu!", "Ready to start!"],
  ["Chúng tôi sẽ tạo kế hoạch 30 ngày dựa trên sở thích và", "We will create a 30-day plan based on your preferences and"],
  ["ngân sách của bạn.", "your budget."],
  ["Quay lại", "Back"],
  ["Tạo kế hoạch", "Generate plan"],
  ["Tiếp tục", "Continue"],
  ["Tạo mật khẩu mới để tiếp tục đăng nhập vào BudgetFit", "Create a new password to continue signing in to BudgetFit"],
  ["Đang kiểm tra liên kết đặt lại mật khẩu...", "Checking password reset link..."],
  ["Đổi mật khẩu thành công", "Password changed successfully"],
  ["Bạn có thể dùng mật khẩu mới để đăng nhập.", "You can use your new password to sign in."],
  ["Liên kết đặt lại mật khẩu không hợp lệ.", "Password reset link is invalid."],
  ["Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.", "Password reset link is invalid or expired."],
  ["Mật khẩu phải có ít nhất 8 ký tự", "Password must be at least 8 characters"],
  ["Mật khẩu phải có ít nhất một chữ hoa", "Password must include at least one uppercase letter"],
  ["Mật khẩu phải có ít nhất một chữ thường", "Password must include at least one lowercase letter"],
  ["Mật khẩu phải có ít nhất một số", "Password must include at least one number"],
  ["Vui lòng xác nhận mật khẩu", "Please confirm your password"],
  ["Mật khẩu xác nhận không khớp", "Passwords do not match"],
  ["Chào mừng trở lại!", "Welcome back!"],
  ["Đăng nhập để tiếp tục hành trình sức khỏe của bạn", "Sign in to continue your health journey"],
  ["Bắt đầu hành trình sức khỏe", "Start your health journey"],
  ["Đạt mục tiêu cân nặng trong ngân sách của bạn. Theo dõi bữa ăn,", "Reach your weight goal within your budget. Track meals,"],
  ["bài tập và chi tiêu ở cùng một nơi.", "workouts, and spending in one place."],
  ["Đang đăng nhập...", "Signing in..."],
  ["Hoặc tiếp tục với", "Or continue with"],
  ["Chưa thể đăng nhập Google vì chưa cấu hình", "Google sign-in is unavailable because"],
  ["Chưa có tài khoản?", "Do not have an account?"],
  ["Theo dõi từng bước tiến", "Track every step forward"],
  ["Theo dõi tiến độ bằng số liệu thực tế. Giữ động lực với mục tiêu", "Track progress with real metrics. Stay motivated with goals"],
  ["Tạo tài khoản", "Create account"],
  ["Đã có tài khoản?", "Already have an account?"],
  ["Kiểm tra email của bạn", "Check your email"],
  ["Nhập email để nhận hướng dẫn đặt lại mật khẩu", "Enter your email to receive reset instructions"],
  ["Chúng tôi sẽ gửi cho bạn liên kết đặt lại mật khẩu", "We will send you a link to reset your password"],
  ["Mở ứng dụng email", "Open email app"],
  ["Bạn nhớ mật khẩu rồi?", "Remember your password?"],
  ["Không nhận được email?", "Did not receive the email?"],
  ["Thử lại", "Try again"],
  ["Minh họa tập luyện", "Workout illustration"],
  ["Cân buổi sáng", "Morning weight"],
  ["Bữa ăn trong ngày", "Daily meal"],
  ["Ngân sách thực tế", "Actual budget"],
  ["So sánh chi tiêu thực tế với ngân sách kế hoạch", "Compare actual spending with planned budget"],
  ["Đã chi thực tế", "Actual spent"],
  ["7 ngày gần nhất", "Last 7 days"],
  ["Chi phí dự kiến và chi phí thực tế theo ngày", "Planned and actual cost by day"],
  ["Dự kiến", "Planned"],
  ["Thực tế", "Actual"],
  ["Huy hiệu đã mở khóa", "Unlocked badges"],
  ["Ghi nhận chuỗi hoàn thành và kiểm soát ngân sách", "Recognize completion streaks and budget control"],
  ["Chưa có huy hiệu. Hoàn thành lịch hằng ngày và nhập chi phí thực tế để mở khóa.", "No badges yet. Complete daily routines and enter actual costs to unlock badges."],
  ["Ngày hoàn thành", "Completed days"],
  ["Bài tập đã làm", "Workouts done"],
  ["Bữa ăn đã ghi nhận", "Meals logged"],
  ["Tiến độ tổng thể", "Overall progress"],
  ["Tổng số ngày", "Total days"],
  ["Chuỗi tốt nhất", "Best streak"],
  ["Hoàn thành tracking hoặc nhiệm vụ hằng ngày để mở khóa thành tựu.", "Complete tracking or daily tasks to unlock achievements."],
  ["Xem kế hoạch 30 ngày", "View 30-day plan"],
  ["Xem các bài tập và bữa ăn sắp tới", "View upcoming workouts and meals"],
  ["Đến kế hoạch", "Go to plan"],
  ["Xem phân bổ ngân sách", "View budget breakdown"],
  ["Tối ưu cách phân bổ chi tiêu của bạn", "Optimize your spending allocation"],
  ["Xem ngân sách", "View budget"],
  ["Từ mục tiêu hồ sơ", "From profile goal"],
  ["Thêm chi tiêu", "Add expense"],
  ["Số tiền (VND)", "Amount (VND)"],
  ["Xóa bản ghi cân nặng này?", "Delete this weight log?"],
  ["Xóa bản ghi chi tiêu này?", "Delete this expense log?"],
  ["Tuổi là bắt buộc và phải lớn hơn 0.", "Age is required and must be greater than 0."],
  ["Chiều cao là bắt buộc và phải lớn hơn 0.", "Height is required and must be greater than 0."],
  ["Cân nặng là bắt buộc và phải lớn hơn 0.", "Weight is required and must be greater than 0."],
  ["Ngân sách là bắt buộc và phải lớn hơn 0.", "Budget is required and must be greater than 0."],
  ["Ngân sách tối thiểu là 3.000.000 VND.", "Minimum budget is 3,000,000 VND."],
  ["Mật khẩu mới và xác nhận mật khẩu không khớp.", "New password and confirmation do not match."],
  ["Đã lưu tùy chọn thông báo.", "Notification preferences saved."],
  ["Đã khởi động lại cuộc đua 30 ngày từ hôm nay.", "The 30-day race has restarted from today."],
  ["Chi phí thực tế không hợp lệ.", "Actual cost is invalid."],
  ["Đã hoàn thành và lưu ngày này.", "This day is completed and saved."],
  ["Đã lưu tiến độ.", "Progress saved."],
  ["Bạn vừa mở khóa huy hiệu", "You just unlocked badge"],
  ["Bài tập", "Workout"],
  ["Đổi món", "Swap meal"],
  ["Đổi bài tập", "Swap workout"],
  ["Bạn dự kiến chi", "You planned to spend"],
  ["No budget yet", "Chưa có ngân sách"],
  ["Chi tiêu tracking và các ngày đã hoàn thành trong kế hoạch", "Tracking expenses and completed plan days"],
  ["Kế hoạch:", "Planned:"],
  ["Match với Budget Breakdown", "Matches Budget Breakdown"],
  ["Food:", "Food:"],
  ["Tổng ngân sách", "Total budget"],
  ["Còn", "Remaining"],
  ["lượt trong tuần này", "available this week"],
  ["để nhận voucher", "to claim voucher"],
  ["giao dịch sẽ bị hủy và voucher chưa được nhận.", "the transaction will be canceled and the voucher will not be claimed."],
  ["Bạn có chắc muốn dùng", "Are you sure you want to use"],
  ["điểm để nhận voucher", "points to claim voucher"],
  ["CN", "Sun"],
  ["T2", "Mon"],
  ["T3", "Tue"],
  ["T4", "Wed"],
  ["T5", "Thu"],
  ["T6", "Fri"],
  ["T7", "Sat"],
  ["Chủ Nhật", "Sunday"],
  ["Thứ Hai", "Monday"],
  ["Thứ Ba", "Tuesday"],
  ["Thứ Tư", "Wednesday"],
  ["Thứ Năm", "Thursday"],
  ["Thứ Sáu", "Friday"],
  ["Thứ Bảy", "Saturday"],
  ["Chủ nhật", "Sunday"],
  ["thứ Hai", "Monday"],
  ["thứ Ba", "Tuesday"],
  ["thứ Tư", "Wednesday"],
  ["thứ Năm", "Thursday"],
  ["thứ Sáu", "Friday"],
  ["thứ Bảy", "Saturday"],
  ["Th 1", "Jan"],
  ["Th 2", "Feb"],
  ["Th 3", "Mar"],
  ["Th 4", "Apr"],
  ["Th 5", "May"],
  ["Th 6", "Jun"],
  ["Th 7", "Jul"],
  ["Th 8", "Aug"],
  ["Th 9", "Sep"],
  ["Th 10", "Oct"],
  ["Th 11", "Nov"],
  ["Th 12", "Dec"],
];

const VI_ALIASES = new Map([
  ["Tong quan", "Tổng quan"],
  ["Ke hoach", "Kế hoạch"],
  ["Theo doi", "Theo dõi"],
  ["Phan thuong", "Phần thưởng"],
  ["Cai dat", "Cài đặt"],
  ["Dang xuat", "Đăng xuất"],
  ["Nguoi dung BudgetFit", "Người dùng BudgetFit"],
  ["Suc khoe va ngan sach", "Sức khỏe và ngân sách"],
]);

const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === "undefined") return "vi";

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return savedLanguage === "en" || savedLanguage === "vi" ? savedLanguage : "vi";
}

function buildMaps() {
  const viToEn = new Map();
  const enToVi = new Map();

  for (const [vi, en] of TRANSLATIONS) {
    viToEn.set(vi, en);
    enToVi.set(en, vi);
  }

  for (const [plainVi, accentedVi] of VI_ALIASES) {
    viToEn.set(plainVi, viToEn.get(accentedVi) || accentedVi);
    enToVi.set(plainVi, accentedVi);
  }

  return { viToEn, enToVi };
}

const { viToEn, enToVi } = buildMaps();

function withWhitespace(original, next) {
  const prefix = original.match(/^\s*/)?.[0] || "";
  const suffix = original.match(/\s*$/)?.[0] || "";
  return `${prefix}${next}${suffix}`;
}

function translateExact(text, language) {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const map = language === "en" ? viToEn : enToVi;
  const translated = map.get(trimmed);
  if (translated) return withWhitespace(text, translated);

  return text;
}

function translatePattern(text, language) {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const replacements =
    language === "en"
      ? [
          [/^Ngày\s+(\d+)$/i, "Day $1"],
          [/^Tuần\s+(\d+)$/i, "Week $1"],
          [/^Bước\s+(\d+)\s+\/\s+(\d+)$/i, "Step $1 / $2"],
          [/^Cấp\s+(\d+)$/i, "Level $1"],
          [/^Cấp\s+(\d+)\s*$/i, "Level $1"],
          [/^Tiến độ tới cấp\s+(\d+)$/i, "Progress to level $1"],
          [/^(\d+)\s+điểm$/i, "$1 points"],
          [/^(.+)\s+điểm$/i, "$1 points"],
          [/^(\d+)\/(\d+)\s+đã đạt$/i, "$1/$2 earned"],
          [/^(\d+)\s+huy hiệu$/i, "$1 badges"],
          [/^Còn\s+(\d+)\s+lượt trong tuần này$/i, "$1 available this week"],
          [/^(\d+)%\s+hoàn thành$/i, "$1% completed"],
          [/^(.+)%\s+tổng ngân sách$/i, "$1% of total budget"],
          [/^~(.+)\s+VND\/ngày$/i, "~$1 VND/day"],
          [/^(.+)\s+VND\/ngày$/i, "$1 VND/day"],
          [/^(\d+)\s+ngày đã hoàn thành$/i, "$1 completed days"],
          [/^Còn\s+(.+)\s+kg tới mục tiêu$/i, "$1 kg left to goal"],
          [/^(.+)\s+kg so với ban đầu$/i, "$1 kg from start"],
          [/^Tổng\s+(\d+)\s+phút$/i, "Total $1 min"],
          [/^Page\s+(\d+)\s+\/\s+(\d+)\s+·\s+(\d+)\s+logs$/i, "Page $1 / $2 · $3 logs"],
          [/^Trang\s+(\d+)\s+\/\s+(\d+)\s+·\s+(\d+)\s+bản ghi$/i, "Page $1 / $2 · $3 logs"],
          [/^tháng\s+1,\s+(\d{4})$/i, "January $1"],
          [/^tháng\s+2,\s+(\d{4})$/i, "February $1"],
          [/^tháng\s+3,\s+(\d{4})$/i, "March $1"],
          [/^tháng\s+4,\s+(\d{4})$/i, "April $1"],
          [/^tháng\s+5,\s+(\d{4})$/i, "May $1"],
          [/^tháng\s+6,\s+(\d{4})$/i, "June $1"],
          [/^tháng\s+7,\s+(\d{4})$/i, "July $1"],
          [/^tháng\s+8,\s+(\d{4})$/i, "August $1"],
          [/^tháng\s+9,\s+(\d{4})$/i, "September $1"],
          [/^tháng\s+10,\s+(\d{4})$/i, "October $1"],
          [/^tháng\s+11,\s+(\d{4})$/i, "November $1"],
          [/^tháng\s+12,\s+(\d{4})$/i, "December $1"],
        ]
      : [
          [/^Day\s+(\d+)$/i, "Ngày $1"],
          [/^Week\s+(\d+)$/i, "Tuần $1"],
          [/^Step\s+(\d+)\s+\/\s+(\d+)$/i, "Bước $1 / $2"],
          [/^Level\s+(\d+)$/i, "Cấp $1"],
          [/^Progress to level\s+(\d+)$/i, "Tiến độ tới cấp $1"],
          [/^(\d+)\s+points$/i, "$1 điểm"],
          [/^(.+)\s+points$/i, "$1 điểm"],
          [/^(\d+)\/(\d+)\s+earned$/i, "$1/$2 đã đạt"],
          [/^(\d+)\s+badges$/i, "$1 huy hiệu"],
          [/^(\d+)\s+available this week$/i, "Còn $1 lượt trong tuần này"],
          [/^(\d+)%\s+completed$/i, "$1% hoàn thành"],
          [/^(.+)%\s+of total budget$/i, "$1% tổng ngân sách"],
          [/^~(.+)\s+VND\/day$/i, "~$1 VND/ngày"],
          [/^(.+)\s+VND\/day$/i, "$1 VND/ngày"],
          [/^(\d+)\s+completed days$/i, "$1 ngày đã hoàn thành"],
          [/^(.+)\s+kg left to goal$/i, "Còn $1 kg tới mục tiêu"],
          [/^(.+)\s+kg from start$/i, "$1 kg so với ban đầu"],
          [/^Total\s+(\d+)\s+min$/i, "Tổng $1 phút"],
          [/^Page\s+(\d+)\s+\/\s+(\d+)\s+·\s+(\d+)\s+logs$/i, "Trang $1 / $2 · $3 bản ghi"],
          [/^January\s+(\d{4})$/i, "tháng 1, $1"],
          [/^February\s+(\d{4})$/i, "tháng 2, $1"],
          [/^March\s+(\d{4})$/i, "tháng 3, $1"],
          [/^April\s+(\d{4})$/i, "tháng 4, $1"],
          [/^May\s+(\d{4})$/i, "tháng 5, $1"],
          [/^June\s+(\d{4})$/i, "tháng 6, $1"],
          [/^July\s+(\d{4})$/i, "tháng 7, $1"],
          [/^August\s+(\d{4})$/i, "tháng 8, $1"],
          [/^September\s+(\d{4})$/i, "tháng 9, $1"],
          [/^October\s+(\d{4})$/i, "tháng 10, $1"],
          [/^November\s+(\d{4})$/i, "tháng 11, $1"],
          [/^December\s+(\d{4})$/i, "tháng 12, $1"],
        ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(trimmed)) {
      return withWhitespace(text, trimmed.replace(pattern, replacement));
    }
  }

  return text;
}

export function translateText(text, language) {
  const exact = translateExact(text, language);
  if (exact !== text) return exact;
  return translatePattern(text, language);
}

function shouldSkipNode(node) {
  const parent = node.parentElement;
  if (!parent) return true;

  return Boolean(
    parent.closest(
      "script, style, noscript, code, pre, input, textarea, [data-no-translate]",
    ),
  );
}

function translateElement(root, language) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    if (shouldSkipNode(node)) continue;

    const nextText = translateText(node.nodeValue || "", language);
    if (nextText !== node.nodeValue) {
      node.nodeValue = nextText;
    }
  }

  const attrElements = root.querySelectorAll?.("[placeholder], [title], [aria-label]") || [];
  for (const element of attrElements) {
    if (element.closest("[data-no-translate]")) continue;

    for (const attr of ["placeholder", "title", "aria-label"]) {
      const value = element.getAttribute(attr);
      if (!value) continue;

      const nextValue = translateText(value, language);
      if (nextValue !== value) {
        element.setAttribute(attr, nextValue);
      }
    }
  }
}

function LanguageDomBridge({ language }) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    let frameId = 0;
    const scheduleTranslate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        translateElement(document.body, language);
      });
    };

    scheduleTranslate();

    const observer = new MutationObserver(scheduleTranslate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [language]);

  return null;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === "vi" ? "en" : "vi")),
      t: (text) => translateText(text, language),
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <LanguageDomBridge language={language} />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
