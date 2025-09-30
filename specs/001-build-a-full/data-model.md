# Data Model (Phase 1)

## Entities
- Post(title, slug, status, publishDate, content, excerpt, topics[], readTime, coverImage?, createdAt, updatedAt, authorId)
- Topic(name, slug, description?)
- Project(title, summary, roleContext, highlights[], links{repo?, live?}, images[]?)
- AuthorProfile(name, bio, avatar?, socialLinks, email)
- AdminUser(usernameOrEmail, passwordHash, role=admin, createdAt, lastLogin)

## Relationships
- Post has many Topics (many-to-many)
- AuthorProfile authored many Posts (one-to-many)

## Constraints
- slug unique per Post and per Topic
- Post.status ∈ {draft, published}
- AdminUser.password is hashed; no plaintext storage
