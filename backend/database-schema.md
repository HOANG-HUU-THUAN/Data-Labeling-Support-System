Database Schema
==================

Users
--------

-   **id** (bigint, PK, auto increment)

-   **username** (varchar, unique, not null)

-   **password** (varchar, not null)

-   **email** (varchar, unique)

-   **status** (varchar)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

-   **updated_at** (timestamp)

* * * * *

Roles
--------

-   **id** (bigint, PK, auto increment)

-   **name** (varchar)

-   **deleted** (boolean, default: false)

* * * * *

User Roles (Many-to-Many)
----------------------------

-   **user_id** (bigint, FK → users.id)

-   **role_id** (bigint, FK → roles.id)

* * * * *

Projects
-----------

-   **id** (bigint, PK, auto increment)

-   **name** (varchar)

-   **description** (text)

-   **type** (varchar)

-   **created_by** (bigint, FK → users.id)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

-   **updated_at** (timestamp)

* * * * *

Datasets
-----------

-   **id** (bigint, PK, auto increment)

-   **project_id** (bigint, FK → projects.id)

-   **name** (varchar)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

* * * * *

Images
----------

-   **id** (bigint, PK, auto increment)

-   **dataset_id** (bigint, FK → datasets.id)

-   **file_path** (varchar)

-   **status** (varchar)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

* * * * *

Labels
----------

-   **id** (bigint, PK, auto increment)

-   **project_id** (bigint, FK → projects.id)

-   **name** (varchar)

-   **color** (varchar)

-   **deleted** (boolean, default: false)

* * * * *

Tasks
--------

-   **id** (bigint, PK, auto increment)

-   **project_id** (bigint, FK → projects.id)

-   **assigned_annotator** (bigint, FK → users.id)

-   **assigned_reviewer** (bigint, FK → users.id)

-   **status** (varchar)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

* * * * *

Task Images (Many-to-Many)
------------------------------

-   **task_id** (bigint, FK → tasks.id)

-   **image_id** (bigint, FK → images.id)

* * * * *

Annotations
--------------

-   **id** (bigint, PK, auto increment)

-   **image_id** (bigint, FK → images.id)

-   **task_id** (bigint, FK → tasks.id)

-   **label_id** (bigint, FK → labels.id)

-   **type** (varchar)

-   **coordinates** (jsonb)

-   **created_by** (bigint, FK → users.id)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

* * * * *

Reviews
---------

-   **id** (bigint, PK, auto increment)

-   **task_id** (bigint, FK → tasks.id)

-   **reviewer_id** (bigint, FK → users.id)

-   **status** (varchar)

-   **comment** (text)

-   **deleted** (boolean, default: false)

-   **created_at** (timestamp)

* * * * *

Audit Logs
-------------

-   **id** (bigint, PK, auto increment)

-   **user_id** (bigint, FK → users.id)

-   **action** (varchar)

-   **ip_address** (varchar)