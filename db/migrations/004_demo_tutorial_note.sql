UPDATE tutorials
SET steps=jsonb_set(steps,'{4,text}','"保存后可投稿。展示期间投稿会自动通过，立即进入作品展。"'::jsonb),
    updated_at=now()
WHERE slug='angular-window'
AND steps#>>'{4,text}'='保存后可投稿。投稿将先进入审核，审核通过后进入作品展。';
