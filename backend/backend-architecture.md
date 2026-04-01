src/main/java/com/yourname/datalabeling/
│
├── config/                      // Cấu hình toàn hệ thống
│   ├── AppConfig.java
│   ├── JpaAuditConfig.java
│   ├── OpenApiConfig.java
│   ├── SecurityConfig.java
│   ├── StorageConfig.java
│   └── WebMvcConfig.java
│
├── security/                    // Authentication + Authorization (JWT)
│   ├── entrypoint/
│   │   ├── CustomAccessDeniedHandler.java
│   │   └── JwtAuthenticationEntryPoint.java
│   ├── filter/
│   │   └── JwtAuthenticationFilter.java
│   ├── jwt/
│   │   ├── JwtTokenProvider.java
│   │   └── JwtTokenValidator.java
│   └── service/
│       └── CustomUserDetailsService.java
│
├── common/                      // Dùng chung toàn hệ thống
│   ├── base/
│   │   ├── BaseEntity.java
│   │   └── BaseDTO.java
│   │
│   ├── constant/
│   │   └── AppConstants.java
│   │
│   ├── enums/
│   │   ├── ErrorCode.java
│   │   ├── LabelType.java
│   │   ├── ProjectType.java
│   │   ├── RoleType.java
│   │   ├── TaskStatus.java
│   │   └── RejectReasonType.java
│   │
│   ├── exception/
│   │   ├── CustomAppException.java
│   │   ├── ResourceNotFoundException.java
│   │   └── GlobalExceptionHandler.java
│   │
│   ├── response/
│   │   ├── ApiResponse.java
│   │   └── PageResponse.java
│   │
│   ├── util/
│   │   ├── FileUtil.java
│   │   ├── SecurityUtil.java
│   │   └── StringUtil.java
│   │
│   └── validator/              //  thêm vào (validate chung)
│       └── CustomValidator.java
│
├── modules/                    //  CORE BUSINESS (feature-based)
│
│   ├── auth/                  // Authentication
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   └── service/
│   │       ├── AuthService.java
│   │       └── impl/
│   │           └── AuthServiceImpl.java
│
│   ├── user/                  // User management (Admin)
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   ├── mapper/
│   │   ├── repository/
│   │   └── service/
│   │       ├── UserService.java
│   │       └── impl/
│   │           └── UserServiceImpl.java
│
│   ├── audit/                 // Audit log
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   ├── repository/
│   │   └── service/
│   │       ├── AuditService.java
│   │       └── impl/
│   │           └── AuditServiceImpl.java
│
│   ├── project/               // Project + Label config
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   ├── mapper/
│   │   ├── repository/
│   │   └── service/
│   │       ├── ProjectService.java
│   │       └── impl/
│   │           └── ProjectServiceImpl.java
│
│   ├── dataset/               // Dataset + Export + Storage
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   │
│   │   ├── exporter/          //  Strategy Pattern
│   │   │   ├── DataExporter.java
│   │   │   ├── CocoExporterImpl.java
│   │   │   ├── PascalVocExporterImpl.java
│   │   │   └── YoloExporterImpl.java
│   │   │
│   │   ├── storage/           //  Storage abstraction
│   │   │   ├── StorageService.java
│   │   │   ├── S3StorageServiceImpl.java
│   │   │   └── LocalStorageServiceImpl.java
│   │   │
│   │   ├── mapper/
│   │   ├── repository/
│   │   └── service/
│   │       ├── DatasetService.java
│   │       └── impl/
│   │           └── DatasetServiceImpl.java
│
│   ├── task/                  // Task + assignment + locking
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   │
│   │   ├── locking/           // concurrency control
│   │   │   └── TaskLockManager.java
│   │   │
│   │   ├── mapper/
│   │   ├── repository/
│   │   └── service/
│   │       ├── TaskService.java
│   │       └── impl/
│   │           └── TaskServiceImpl.java
│
│   ├── annotation/            // Labeling workspace
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   │
│   │   ├── validator/         //  rename từ engine
│   │   │   ├── BoundingBoxValidator.java
│   │   │   └── PolygonValidator.java
│   │   │
│   │   ├── entity/
│   │   ├── mapper/
│   │   ├── repository/
│   │   └── service/
│   │       ├── AnnotationService.java
│   │       └── impl/
│   │           └── AnnotationServiceImpl.java
│
│   ├── review/                // Review annotation
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   ├── mapper/
│   │   ├── repository/
│   │   └── service/
│   │       ├── ReviewService.java
│   │       └── impl/
│   │           └── ReviewServiceImpl.java
│
│   ├── ai/                    // AI integration
│   │   ├── controller/
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   │
│   │   ├── integration/
│   │   │   └── AiModelWebClient.java
│   │   │
│   │   └── service/
│   │       ├── AiService.java
│   │       └── impl/
│   │           └── AiServiceImpl.java
│
│   └── dashboard/             // Statistics & report
│       ├── controller/
│       ├── dto/
│       │   ├── request/
│       │   └── response/
│       ├── repository/
│       │   └── DashboardRepositoryCustom.java
│       └── service/
│           ├── DashboardService.java
│           └── impl/
│               └── DashboardServiceImpl.java
│
└── DataLabelingApplication.java