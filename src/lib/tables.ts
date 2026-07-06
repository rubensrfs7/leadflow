export const tableConfigs = [
  {
    "name": "items",
    "label": "Items",
    "route": "/app/items",
    "endpoint": "/api/items",
    "primaryKey": "id",
    "columns": [
      {
        "name": "id",
        "label": "Id",
        "type": "integer",
        "pk": true,
        "nullable": false,
        "editable": false,
        "visible": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "varchar(255)",
        "pk": false,
        "nullable": false,
        "editable": true,
        "visible": true
      },
      {
        "name": "created_at",
        "label": "Created At",
        "type": "timestamp",
        "pk": false,
        "nullable": false,
        "editable": false,
        "visible": false
      },
      {
        "name": "updated_at",
        "label": "Updated At",
        "type": "timestamp",
        "pk": false,
        "nullable": false,
        "editable": false,
        "visible": false
      }
    ],
    "parentLookups": [],
    "childCollections": []
  },
  {
    "name": "user",
    "label": "User",
    "route": "/app/user",
    "endpoint": "/api/user",
    "primaryKey": "id",
    "columns": [
      {
        "name": "id",
        "label": "Id",
        "type": "uuid",
        "pk": true,
        "nullable": false,
        "editable": false,
        "visible": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "varchar(255)",
        "pk": false,
        "nullable": false,
        "editable": true,
        "visible": true
      },
      {
        "name": "email",
        "label": "Email",
        "type": "varchar(255)",
        "pk": false,
        "nullable": false,
        "editable": true,
        "visible": true
      },
      {
        "name": "password",
        "label": "Password",
        "type": "varchar(255)",
        "pk": false,
        "nullable": false,
        "editable": true,
        "visible": false
      },
      {
        "name": "created_at",
        "label": "Created At",
        "type": "timestamp",
        "pk": false,
        "nullable": false,
        "editable": false,
        "visible": false
      },
      {
        "name": "updated_at",
        "label": "Updated At",
        "type": "timestamp",
        "pk": false,
        "nullable": false,
        "editable": false,
        "visible": false
      }
    ],
    "parentLookups": [],
    "childCollections": []
  }
] as const;

export type TableConfig = (typeof tableConfigs)[number];
