# Git Workflow Nội Bộ

Tài liệu này dùng để thống nhất cách làm việc với Git/GitHub trong nhóm, nhằm tránh nhầm lẫn về `main`, branch, commit, push, pull request và merge.

## 1. Mục tiêu của tài liệu

- Giúp mọi người hiểu vai trò của từng nhánh trong project.
- Tránh sửa trực tiếp lên `main` khi chưa thống nhất.
- Tránh trộn nhiều task khác nhau vào cùng một branch.
- Giúp review code dễ hơn.
- Giảm conflict và các lỗi do thao tác Git sai.

## 2. Hiểu đúng về `main`

`main` là nhánh chính của project.

Nên hiểu `main` là:

- nơi chứa code tương đối ổn định
- nơi tập hợp các thay đổi đã được chấp nhận
- nhánh mà cả nhóm có thể dùng làm mốc chung

Không nên:

- code trực tiếp trên `main`
- commit nhiều thay đổi chưa hoàn thiện lên `main`
- dùng `main` để thử nghiệm tính năng mới

## 3. Khi nào cần tạo branch mới

Mỗi công việc riêng nên dùng một branch riêng.

Ví dụ:

- thêm Google login -> `feature/google-login`
- sửa README -> `docs/update-readme`
- sửa lỗi auth -> `fix/auth-bug`
- refactor service -> `refactor/auth-service`

Không nên:

- dùng một branch cho nhiều việc không liên quan
- vừa sửa backend, vừa sửa frontend, vừa sửa docs trong cùng một task nếu các phần đó không liên quan nhau

## 4. Quy ước đặt tên branch

Nên dùng các prefix sau:

- `feature/` cho tính năng mới
- `fix/` cho sửa lỗi
- `docs/` cho tài liệu
- `refactor/` cho cải tổ code
- `test/` cho test

Ví dụ:

- `feature/google-login`
- `feature/plan-generation`
- `fix/mysql-connection`
- `docs/update-readme`
- `refactor/auth-service`

## 5. Quy trình làm việc chuẩn

Mỗi khi bắt đầu một task mới, làm theo quy trình này:

### Bước 1: Chuyển về `main`

```bash
git checkout main
```

### Bước 2: Kéo code mới nhất từ GitHub

```bash
git pull origin main
```

### Bước 3: Tạo branch mới từ `main`

```bash
git checkout -b feature/google-login
```

### Bước 4: Code trên branch đó

Sau khi sửa code xong, kiểm tra:

```bash
git status
```

### Bước 5: Add đúng file cần commit

Nếu muốn add toàn bộ thay đổi của task:

```bash
git add .
```

Nếu chỉ muốn add một file:

```bash
git add README.md
```

Nếu chỉ muốn add một thư mục:

```bash
git add backend
git add frontend
```

### Bước 6: Commit

```bash
git commit -m "Add Google Sign-In for frontend and backend"
```

### Bước 7: Push branch lên GitHub

```bash
git push -u origin feature/google-login
```

### Bước 8: Tạo Pull Request

Tạo PR từ branch của mình vào `main`.

### Bước 9: Sau khi PR được merge

```bash
git checkout main
git pull origin main
```

Nếu branch đã xong, có thể xóa branch local:

```bash
git branch -d feature/google-login
```

## 6. Hiểu đúng về `git status`

`git status` không phải lỗi. Nó chỉ cho biết trạng thái file.

Các trạng thái thường gặp:

- `modified`: file đã bị sửa nhưng chưa được stage
- `untracked`: file mới tạo, Git chưa theo dõi
- `changes to be committed`: file đã được add và sẵn sàng commit

Ví dụ:

- thấy `modified` -> cần `git add`
- thấy `untracked` -> cần `git add`
- thấy `nothing to commit, working tree clean` -> branch hiện tại sạch

## 7. Hiểu đúng về `git add`

`git add` không phải là push.

`git add` chỉ đưa file vào vùng chuẩn bị commit.

Ví dụ:

```bash
git add README.md
```

Nghĩa là:

- chỉ file `README.md` được chuẩn bị để commit
- các file khác chưa được commit

## 8. Hiểu đúng về commit

Commit là một mốc thay đổi có ý nghĩa.

Một commit tốt nên:

- chỉ chứa một nhóm thay đổi liên quan
- có message rõ ràng
- dễ review

Ví dụ commit tốt:

- `Add Google Sign-In endpoint`
- `Update project README`
- `Fix MySQL database name in env`

Ví dụ commit không tốt:

- `update`
- `fix bug`
- `code mới`

## 9. Quy ước viết commit message

Nên viết ngắn, rõ, mô tả hành động.

Mẫu nên dùng:

- `Add ...`
- `Update ...`
- `Fix ...`
- `Refactor ...`
- `Remove ...`

Ví dụ:

- `Add Google login backend flow`
- `Update README with project overview`
- `Fix auth validation error handling`
- `Refactor plan service queries`

## 10. Hiểu đúng về push

`git push` là đưa commit từ máy local lên GitHub.

Ví dụ:

```bash
git push -u origin feature/google-login
```

Lệnh này chỉ push branch `feature/google-login` lên GitHub.

Nó không tự động:

- sửa `main`
- merge vào `main`
- làm thay đổi xuất hiện trong branch `main`

## 11. Vì sao push xong mà chưa thấy trên `main`

Đây là điều bình thường.

Khi push branch `feature/google-login`, code chỉ nằm ở branch đó trên GitHub.

Muốn code xuất hiện trong `main`, cần:

1. tạo Pull Request
2. review
3. merge vào `main`

## 12. Hiểu đúng về Pull Request

Pull Request là yêu cầu đưa code từ branch của bạn vào `main`.

PR nên dùng khi:

- task đã đủ rõ để review
- code đã chạy được ở mức cơ bản
- thay đổi không còn là thử nghiệm ngẫu nhiên

PR giúp:

- mọi người xem diff
- review code
- comment trực tiếp
- test trước khi merge

## 13. Khi nào nên tách branch

Nếu branch hiện tại chứa nhiều thứ khác nhau, nên tách ra.

Ví dụ:

Branch `feature/google-login` đang có:

- backend auth
- frontend login button
- README update

Nếu chỉ muốn merge README trước, không nên mở PR từ branch đó.

Cần tạo branch mới chỉ chứa README:

```bash
git checkout main
git pull origin main
git checkout -b docs/update-readme
git checkout feature/google-login -- README.md
git add README.md
git commit -m "Update project README"
git push -u origin docs/update-readme
```

## 14. Những nguyên tắc nội bộ nên tuân thủ

- Không commit trực tiếp lên `main`
- Mỗi task riêng dùng một branch riêng
- Mỗi PR chỉ nên giải quyết một vấn đề chính
- Không trộn docs, bugfix và feature nếu không cần thiết
- Trước khi tạo branch mới, luôn `pull` từ `main`
- Trước khi commit, luôn kiểm tra `git status`
- Trước khi push, nên đọc lại `git diff`

## 15. Các lệnh Git thường dùng

### Kiểm tra branch hiện tại

```bash
git branch --show-current
```

### Xem trạng thái file

```bash
git status
```

### Xem danh sách branch

```bash
git branch
```

### Tạo branch mới

```bash
git checkout -b ten-branch
```

### Chuyển branch

```bash
git checkout main
```

### Add file

```bash
git add README.md
```

### Add tất cả

```bash
git add .
```

### Commit

```bash
git commit -m "Update README"
```

### Push branch mới

```bash
git push -u origin ten-branch
```

### Pull code mới nhất từ `main`

```bash
git pull origin main
```

### Xem lịch sử commit ngắn

```bash
git log --oneline
```

### Xem diff chưa commit

```bash
git diff
```

### Bỏ stage một file

```bash
git restore --staged README.md
```

### Bỏ stage toàn bộ

```bash
git restore --staged .
```

## 16. Các tình huống thường gặp

### Tình huống 1: Lỡ sửa trên `main`

Nếu chưa commit:

```bash
git checkout -b feature/ten-task
```

Git sẽ giữ nguyên thay đổi hiện tại và chuyển chúng sang branch mới.

### Tình huống 2: Lỡ `git add .` nhưng chỉ muốn commit một file

Bỏ stage toàn bộ:

```bash
git restore --staged .
```

Sau đó add lại đúng file:

```bash
git add README.md
```

### Tình huống 3: Push xong mà không thấy trên `main`

Kiểm tra:

- có đang xem đúng branch trên GitHub không
- đã tạo PR chưa
- PR đã merge chưa

### Tình huống 4: Chỉ muốn merge README, chưa muốn merge code

Tạo branch mới từ `main` và lấy riêng `README.md` sang branch đó.

### Tình huống 5: Muốn người khác test branch trước khi merge

Người đó chỉ cần:

```bash
git fetch origin
git checkout -b feature/google-login origin/feature/google-login
```

Sau đó cài dependency, env, migration nếu cần và chạy project.

## 17. Quy trình review nội bộ đề xuất

Trước khi tạo PR, người làm task nên tự kiểm tra:

- code đã chạy chưa
- file `.env` có bị commit nhầm không
- có file rác không
- migration đã kèm chưa nếu có đổi database
- README/docs có cần cập nhật không

Người review nên kiểm tra:

- thay đổi có đúng phạm vi task không
- có đụng file ngoài phạm vi không
- branch có bị trộn nhiều việc không
- có hướng dẫn chạy/test không

## 18. Quy ước với project này

Với repo hiện tại, nhóm nên thống nhất:

- `main` là branch ổn định
- feature backend/frontend lớn phải tách branch riêng
- thay đổi DB phải có file migration tương ứng trong `backend/database/`
- thay đổi docs nên dùng branch `docs/...`
- khi thêm tính năng mới, cần ghi rõ nếu cần update `.env`, package hoặc migration

## 19. Tóm tắt ngắn

Cách làm việc chuẩn:

1. `checkout main`
2. `pull main`
3. tạo branch mới
4. code
5. `git status`
6. `git add`
7. `git commit`
8. `git push`
9. tạo PR
10. merge vào `main`

## 20. Kết luận

Nếu cả nhóm thống nhất làm theo một workflow chung, mọi người sẽ:

- ít ghi đè code của nhau hơn
- dễ review hơn
- dễ rollback hơn
- dễ tách task hơn
- giảm hiểu nhầm khi làm việc nhóm

Tài liệu này nên được dùng làm quy ước nội bộ khi bắt đầu mỗi task mới.
