-- User-authorized demonstration policy: existing pending submissions become
-- public, while unsubmitted drafts and previously rejected works stay private.
UPDATE works
SET status='published',published_at=now(),updated_at=now(),
    version=version+1,review_note='展示期间自动通过'
WHERE status='pending';
