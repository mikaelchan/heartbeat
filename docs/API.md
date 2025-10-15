# Heartbeat API

The Heartbeat API is designed to power both the web client and future native apps (e.g., iOS). It follows RESTful conventions and returns JSON.

Base URL: `https://<your-domain>/api`

## Authentication

Authentication is not implemented yet. When adding auth (for example, JWT or session tokens), use Express middleware to protect the routes below.

## Endpoints

### Relationship

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/relationship` | Retrieve the relationship meta data (start date, milestones, etc.). Returns `404` if not yet configured. |
| `PUT` | `/relationship` | Create or update the relationship document. Supply `coupleNames`, `startedOn`, and `milestones`. |

### Memories

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/memories` | List memory entries sorted by date descending. |
| `POST` | `/memories` | Create a new memory entry. Payload should include `title`, `description`, `photoUrl`, `location` (`lat`, `lng`, `placeName`), and `happenedOn`. |

### Plans

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/plans` | List all future (or completed) plans sorted by `scheduledOn`. |
| `POST` | `/plans` | Create a new plan entry. |
| `PATCH` | `/plans/:id` | Update a plan, typically for status changes or attachment updates. |

### Bucket List

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/bucket` | List bucket list items sorted by `order`. |
| `POST` | `/bucket` | Create a new bucket list item. |
| `PATCH` | `/bucket/:id` | Update an existing bucket list item (e.g., mark `completed`). |

### Messages

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/messages` | List messages sorted by newest first. |
| `POST` | `/messages` | Create a new timeline message. |

## Data Models

All resources use MongoDB documents managed by Mongoose models defined in `server/src/models`.

### Relationship

```ts
{
  coupleNames: string[];
  startedOn: Date;
  milestones: { label: string; date: Date }[];
}
```

### Memory

```ts
{
  title: string;
  description: string;
  photoUrl: string;
  location: {
    lat: number;
    lng: number;
    placeName: string;
  };
  happenedOn: Date;
}
```

### Plan

```ts
{
  title: string;
  description: string;
  scheduledOn: Date;
  attachments: string[]; // optional image URLs or references
  status: 'upcoming' | 'completed' | 'in-progress';
}
```

### Bucket Item

```ts
{
  order: number;
  title: string;
  completed: boolean;
}
```

### Message

```ts
{
  author: 'me' | 'partner';
  content: string;
  createdAt: Date;
}
```

## Future Extensions

- **Mobile Integration**: Keep the API stateless and document response formats to support an iOS client. Consider adding pagination and optimistic locking when the message volume grows.
- **Media Handling**: Move `photoUrl`/`attachments` to an asset service or S3 bucket when user uploads are supported.
- **Authentication**: Introduce auth middleware, rate limiting, and audit logs for edits.
- **Webhooks/Notifications**: Add event emitters when new messages or plans are created to integrate with push notifications for the mobile app.
