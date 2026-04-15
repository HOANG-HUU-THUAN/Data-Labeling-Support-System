**0\. BASE CONFIG**
===================

Base URL: /api/v1

Auth: Bearer Token (JWT)

* * * * *

**1\. AUTH API**
===================

POST --/auth/login

POST --/auth/refresh-token

POST --/auth/logout

GET ---/auth/me

* * * * *

**2\. USER (ADMIN)**
=======================

GET ---/users

POST --/users

GET ---/users/{id}

PUT ---/users/{id}

DELETE /users/{id} -------------(soft delete)

PATCH -/users/{id}/lock

PATCH -/users/{id}/unlock

* * * * *

**3\. PROJECT (MANAGER)**
============================

GET ---/projects

POST --/projects

GET ---/projects/{id}

PUT ---/projects/{id}

DELETE /projects/{id} ----------(soft delete)

* * * * *

**4\. LABEL**
================

GET ---/projects/{projectId}/labels

POST --/projects/{projectId}/labels

PUT ---/labels/{id}

DELETE /labels/{id} ------------(soft delete)

* * * * *

**5. DATASET (IMAGE)**
==========================

POST --/projects/{projectId}/datasets/upload

GET ---/projects/{projectId}/datasets

GET ---/datasets/{id}

DELETE /datasets/{id} ----------(soft delete)

* * * * *

**6\. TASK (QUAN TRỌNG NHẤT)**
=================================

GET ---/tasks

POST --/projects/{projectId}/tasks

GET ---/tasks/{id}

PUT ---/tasks/{id}

DELETE /tasks/{id} -------------(soft delete)

PATCH -/tasks/{id}/assign

PATCH -/tasks/{id}/status

* * * * *

**7. ANNOTATOR API**
=======================

**Task của tôi**
----------------

GET ---/annotator/tasks

GET ---/annotator/tasks/{taskId}

**Ảnh trong task**
------------------

GET ---/tasks/{taskId}/images

GET ---/images/{id}

**Lock (tránh conflict)**
-------------------------

POST --/images/{id}/lock

POST --/images/{id}/unlock

**Annotation**
--------------

GET ---/images/{imageId}/annotations

POST --/annotations

PUT ---/annotations/{id}

DELETE /annotations/{id} -------(soft delete)

### POST /api/v1/annotations (Save annotations for an image in a task)

Request JSON:

```json
{
  "taskId": 123,
  "imageId": 456,
  "replaceExisting": true,
  "annotations": [
    {
      "labelId": 1,
      "type": "BBOX",
      "coordinates": { "x": 10, "y": 20, "width": 100, "height": 80 }
    },
    {
      "labelId": 2,
      "type": "POLYGON",
      "coordinates": { "points": [ [10, 10], [40, 12], [28, 60] ] }
    },
    {
      "labelId": 3,
      "type": "TAG",
      "coordinates": { "value": true }
    }
  ]
}
```

Notes:
- `coordinates` is stored as `jsonb` and can be any JSON object, depending on the tool/type.
- If `replaceExisting=true` (default), backend will soft-delete existing annotations (same task+image, same annotator) then insert the new list.
- When saving annotations for a `PENDING` task, backend automatically sets task status to `IN_PROGRESS`.

Response JSON (wrapped):

```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "taskId": 123,
    "imageId": 456,
    "annotationIds": [ 1001, 1002, 1003 ]
  }
}
```

**Submit**
----------

POST --/tasks/{taskId}/submit

### POST /api/v1/tasks/{taskId}/submit (Submit task for review)

Behavior:
- Marks task status to `IN_REVIEW`.
- Requires the current user to be the assigned annotator (or ADMIN).

Response JSON (wrapped):

```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "taskId": 123,
    "oldStatus": "IN_PROGRESS",
    "newStatus": "IN_REVIEW"
  }
}
```

* * * * *

**8\. REVIEWER API**
=======================

GET ---/reviewer/tasks

GET ---/reviewer/tasks/{taskId}

**Review detail**
-----------------

GET ---/tasks/{taskId}/review

**Approve / Reject**
--------------------

POST --/reviews/{taskId}/approve

POST --/reviews/{taskId}/reject

* * * * *

**9\. DASHBOARD / REPORT**
=============================

GET ---/projects/{id}/stats

GET ---/projects/{id}/progress

GET ---/users/{id}/performance

* * * * *

**10\. EXPORT**
==================

GET ---/projects/{id}/export

Query:

?format=yolo

?format=coco

?format=json

* * * * *

**11\. AI AUTO LABEL**
=========================

POST --/ai/auto-label

* * * * *

**12\. AUDIT LOG**
=====================

GET ---/audit-logs

GET ---/audit-logs/{id}
