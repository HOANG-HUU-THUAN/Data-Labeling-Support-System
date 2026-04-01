Tên dự án: Hệ thống Hỗ trợ Gán nhãn Dữ liệu (Data Labeling Support System
-------------------------------------------------------------------------

1.  **Giới thiệu chung (Introduction)**

    1.1. *Mục đích dự án*\
    Xây dựng một nền tảng phần mềm quản lý toàn bộ vòng đời gán nhãn dữ liệu (Data Labeling Lifecycle) phục vụ cho việc huấn luyện và đánh giá các mô hình Học máy (Machine Learning). Hệ thống giúp chuẩn hóa quy trình từ khâu tạo dự án, phân công công việc, thực hiện gán nhãn, kiểm duyệt chất lượng cho đến khi xuất dữ liệu chuẩn đầu ra.

    1.2. *Vấn đề cần giải quyết (Business Problems)*\
    Hệ thống được sinh ra để giải quyết các hạn chế hiện tại trong quy trình chuẩn bị dữ liệu:Gán nhãn thủ công rời rạc gây tốn thời gian và khó mở rộng quy mô dự án.\
    Chất lượng nhãn thiếu đồng nhất do không có công cụ kiểm soát và bộ quy tắc chung giữa nhiều người gán nhãn (Annotators).\
    Quản lý (Managers) thiếu tầm nhìn tổng quan về tiến độ và không kiểm soát được chất lượng thực tế.\
    Khó khăn trong việc chuẩn hóa và xuất dữ liệu (Export) sang các định dạng tương thích với các mô hình Machine Learning phổ biến (như YOLO, COCO, PASCAL VOC).

1.  **Mô tả tổng quan (Overall Description)**

    Phân quyền người dùng (Primary Actors)\
    Hệ thống áp dụng cơ chế quản lý quyền truy cập dựa trên vai trò (RBAC - Role-Based Access Control) với 4 nhóm người dùng chính:\
    + **Admin**: Quản trị viên hệ thống, quản lý cấu hình và người dùng ở mức cao nhất.\
    + **Manager**: Quản lý dự án, chịu trách nhiệm thiết lập dữ liệu, phân công và theo dõi tiến độ.\
    + **Reviewer**: Người kiểm duyệt, đánh giá độ chính xác của dữ liệu đã được gán nhãn.\
    + **Annotator**: Người trực tiếp thực hiện thao tác gán nhãn (vẽ bounding box, polygon, phân loại...) trên dữ liệu.

1.  **Yêu cầu Chức năng (Functional Requirements)**

    *3.1. Module Quản trị hệ thống (Dành cho Admin)*\
    **F-ADM-01 (Quản lý người dùng)**: Hệ thống phải cho phép Admin thêm, sửa, xóa, khóa tài khoản và phân quyền (Role) cho người dùng.\
    **F-ADM-02 (Cấu hình hệ thống)**: Cho phép cấu hình các tham số hệ thống, giới hạn dung lượng lưu trữ, hoặc thiết lập kết nối với các dịch vụ lưu trữ đám mây (S3, GCS).\
    **F-ADM-03 (Nhật ký hoạt động - Audit Logs)**: Hệ thống phải ghi nhận chi tiết mọi hành động của người dùng (thời gian, IP, thao tác) để phục vụ việc truy vết và đảm bảo an ninh thông tin.

    *3.2. Module Quản lý dự án (Dành cho Manager)*\
    **F-MNG-01 (Quản lý dự án)**: Cho phép tạo dự án mới, định nghĩa tên, mô tả và loại dự án (Image Classification, Object Detection, Segmentation...).\
    **F-MNG-02 (Quản lý bộ dữ liệu - Dataset)**: Cho phép tải lên (upload) dữ liệu thô (ảnh) theo lô (batch) và quản lý tập dữ liệu.\
    **F-MNG-03 (Thiết lập bộ nhãn & Hướng dẫn)**: Manager có thể định nghĩa danh sách các nhãn (Labels/Classes), chọn màu sắc hiển thị, và đính kèm tài liệu hướng dẫn gán nhãn (Guidelines) cho dự án.\
    **F-MNG-04 (Phân công công việc)**: Cho phép Manager chia nhỏ tập dữ liệu thành các gói (Tasks/Batches) và gán cho các Annotator hoặc Reviewer cụ thể.\
    **F-MNG-05 (Theo dõi & Báo cáo)**: Cung cấp Dashboard thống kê tiến độ (số lượng đã gán, đang chờ duyệt, bị từ chối) và hiệu suất của từng cá nhân.\
    **F-MNG-06 (Xuất dữ liệu - Export)**: Hệ thống phải cho phép xuất dữ liệu đã được phê duyệt (Approved) ra các định dạng chuẩn (JSON, XML, CSV, YOLO txt...).

    *3.3. Module Gán nhãn (Dành cho Annotator)*\
    **F-ANN-01 (Nhận nhiệm vụ)**: Hiển thị danh sách các Task đang được phân công, trạng thái (Chưa làm, Đang làm, Cần sửa lại).\
    **F-ANN-02 (Không gian làm việc - Workspace)**: Cung cấp công cụ gán nhãn trên ảnh. Tùy theo loại dự án, Annotator có thể vẽ Bounding Box (khung chữ nhật), Polygon (đa giác), hoặc chọn Tags.\
    **F-ANN-03 (Xem hướng dẫn)**: Cho phép truy cập nhanh vào bộ quy tắc gán nhãn của dự án ngay trên màn hình Workspace.\
    **F-ANN-04 (Nộp kết quả)**: Cho phép đánh dấu hoàn thành ảnh/task và gửi lên hệ thống để chờ kiểm duyệt.\
    **F-ANN-05 (Xử lý phản hồi)**: Nhận thông báo về các nhãn bị Reviewer đánh lỗi (Rejected), xem comment chi tiết và thực hiện chỉnh sửa để nộp lại.

    *3.4. Module Kiểm duyệt (Dành cho Reviewer)*\
    **F-REV-01 (Nhận dữ liệu kiểm duyệt)**: Hiển thị danh sách các Task đã được Annotator nộp.\
    **F-REV-02 (Thẩm định nhãn)**: Hiển thị dữ liệu gốc kèm theo nhãn do Annotator gán. Reviewer có thể bật/tắt hiển thị nhãn để dễ đối chiếu.\
    **F-REV-03 (Phê duyệt hoặc Từ chối)**: Có nút chức năng để "Approve" (Phê duyệt) hoặc "Reject" (Từ chối).\
    **F-REV-04 (Ghi nhận lỗi)**: Nếu Reject, hệ thống bắt buộc Reviewer chọn loại lỗi từ danh mục (Ví dụ: Vẽ thiếu, vẽ lệch, gán sai nhãn) và để lại ghi chú.

    *3.5. Module AI Hỗ trợ (Auto-Labeling / Pre-annotation) - Tùy chọn nâng cao*\
    **F-AI-01 (Gợi ý nhãn tự động)**: Khi Annotator mở một ảnh mới, hệ thống tự động gọi một mô hình ML đã được huấn luyện sẵn (ví dụ: YOLOv8) để quét ảnh và vẽ sẵn các khung/nhãn dự đoán (Pre-annotations).\
    **F-AI-02 (Tinh chỉnh)**: Annotator chỉ cần xác nhận, chỉnh sửa kích thước hoặc xóa các gợi ý sai, giúp giảm tới 70% thời gian thao tác thủ công.

1.  **Yêu cầu Phi chức năng (Non-Functional Requirements)**

    Để hệ thống hoạt động trơn tru, đặc biệt là với một ứng dụng thiên về thao tác đồ họa trên nền web, cần đảm bảo các yếu tố :\
    + Hiệu năng (Performance): Giao diện gán nhãn (Workspace) phải load ảnh nhanh chóng (cân nhắc kỹ thuật Lazy Loading hoặc nén ảnh hiển thị). Thao tác vẽ khung/đa giác không được có độ trễ (lag).\
    + Trải nghiệm người dùng (Usability): Bắt buộc phải hỗ trợ Phím tắt (Keyboard Shortcuts) cho các thao tác thường xuyên (chọn công cụ, zoom ảnh, chuyển ảnh tiếp theo, lưu, nộp).\
    + Bảo mật & Tính toàn vẹn dữ liệu (Security & Integrity):\
    + Xác thực người dùng an toàn.\
    + Dữ liệu ảnh của khách hàng không được phép rò rỉ hoặc tải xuống trái phép.\
    + Đảm bảo tính toàn vẹn (Data Integrity): Cần có cơ chế khóa (Lock) bản ghi khi một người đang edit, tránh tình trạng xung đột dữ liệu (Concurrency issues).

    Kiến trúc công nghệ :\
    + Frontend: ReactJS, Typescript\
    + Backend: Springframework, Java, PostgreSQL