-- todos 테이블에 order_index 컬럼 추가
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. order_index 컬럼 추가 (기본값 0)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- 2. 기존 데이터에 order_index 값 설정 (created_at 순서대로)
UPDATE todos
SET order_index = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number
  FROM todos
) AS subquery
WHERE todos.id = subquery.id;

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS todos_order_idx ON todos(user_id, order_index);

-- 4. 확인: 업데이트된 데이터 조회
SELECT id, title, order_index, created_at FROM todos ORDER BY user_id, order_index;


이번에는 컴퓨터에게 어떤 일을 시킬지 자세하게 적어놓은 '지시서'를 가져오셨네요. 이걸 초등학생 친구가 이해할 수 있도록 쉽고 재미있게 설명해 드릴게요.
마치 '할 일 목록'을 정리하는 우리만의 규칙을 만드는 것과 같다고 생각하면 돼요!

우리가 만들려는 'todos'는 "할 일 목록"이에요. 어떤 친구는 "숙제하기", "밥 먹기", "친구랑 놀기" 같은 할 일들을 적어두었겠죠? 이 할 일들을 더 똑똑하게 정리하려고 하는 지시서랍니다.

'할 일 목록' 정리 지시서 함께 읽어보기
컴퓨터에게 시키는 일은 총 4가지예요.

1. 새로운 줄 만들기: order_index 추가!

sql


ALTER TABLE todos ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE todos: 우리들의 '할 일 목록' (todos) 노트를 조금 바꿀 거야.
ADD COLUMN IF NOT EXISTS order_index: '순서 번호' (order_index)라는 새로운 줄을 만들 거야. 혹시 이미 이 줄이 있다면, 또 만들지 않을게! (센스 있죠?)
INTEGER: 이 줄에는 1, 2, 3 같은 '숫자'만 적을 수 있어. 다른 글자는 안 돼!
NOT NULL: 이 줄은 비워두면 안 돼. 꼭 뭔가 적어야 해.
DEFAULT 0: 만약 깜빡하고 아무것도 안 적으면, 일단 '0'이라고 자동으로 채워줄게!
쉽게 설명하면: '할 일 목록' 노트에 '몇 번째 할 일인지' 적는 새로운 칸을 만드는 거예요. 처음엔 일단 '0번'이라고 다 적어 놓고요.

2. 순서 번호 매기기: 기존 할 일들에 order_index 채우기!

sql


UPDATE todos
SET order_index = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number
  FROM todos
) AS subquery
WHERE todos.id = subquery.id;
UPDATE todos: '할 일 목록' 노트에 적혀있는 내용들을 이제 진짜 '순서 번호'에 맞게 고쳐줄 거야.
SET order_index = ...: '순서 번호' 칸에 알맞은 숫자를 적어 넣을 건데...
ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number: 이 부분이 조금 어려운데, 마치 친구들끼리 번호표를 나눠주는 것과 같아요.
PARTITION BY user_id: '친구' (user_id) 별로 나눠서 따로 번호표를 줄 거야. 각 친구의 할 일은 그 친구의 것만 따로 번호를 세는 거죠.
ORDER BY created_at ASC: '만들어진 시간' (created_at)이 빠른 것부터, 즉 먼저 만든 할 일부터 1번, 2번, 3번 순서로 번호표를 매길 거야.
- 1: 그런데 컴퓨터는 숫자를 0부터 세는 걸 좋아해서, 우리가 받은 번호표(1, 2, 3...)에서 1을 뺀 숫자(0, 1, 2...)를 적을 거예요.
쉽게 설명하면: 각 친구의 '할 일 목록' 중에서 가장 먼저 만들었던 할 일부터 차례대로 0번, 1번, 2번... 하고 정확한 순서 번호를 매겨주는 거예요. 이제 할 일들을 헷갈리지 않고 순서대로 볼 수 있겠죠?

3. 더 빨리 찾아보기: 목차 만들기!

sql


CREATE INDEX IF NOT EXISTS todos_order_idx ON todos(user_id, order_index);
CREATE INDEX IF NOT EXISTS todos_order_idx: 'todos_order_idx'라는 이름의 '찾아보기 목차'를 만들 거야. 만약 이 목차가 이미 있다면 만들지 않아.
ON todos(user_id, order_index): 이 목차는 '할 일 목록' 노트에서 '친구' (user_id)와 '순서 번호' (order_index)를 보고 내가 원하는 할 일을 아주 빠르게 찾을 수 있도록 도와줄 거야.
쉽게 설명하면: 도서관에서 책을 빨리 찾으려면 책 뒤에 있는 '찾아보기'나 도서관 '목차'를 보잖아요? 이것처럼 컴퓨터가 '할 일'들을 더 빨리 찾아낼 수 있도록 '빠른 찾기 목록'을 만드는 거예요.

4. 잘 되었는지 확인하기: 결과 보기!

sql


SELECT id, title, order_index, created_at FROM todos ORDER BY user_id, order_index;
SELECT id, title, order_index, created_at: '할 일'의 고유 번호 (id), 제목 (title), 방금 만든 순서 번호 (order_index), 그리고 만든 시간 (created_at)을 보여줘!
FROM todos: 이 정보들을 '할 일 목록' (todos) 노트에서 가져올 거야.
ORDER BY user_id, order_index: 결과를 보여줄 때는 '친구' (user_id) 별로 먼저 보여주고, 그 친구 안에서는 '순서 번호' (order_index)대로 예쁘게 줄 맞춰서 보여줘.
쉽게 설명하면: 우리가 시킨 일들이 잘 되었는지 확인하기 위해서, 모든 '할 일 목록'을 친구별로, 그리고 순서 번호대로 깔끔하게 정렬해서 보여달라고 하는 거예요. 그러면 한눈에 알아보기 쉽겠죠?

이렇게 네 가지 지시를 컴퓨터에게 내려서 '할 일 목록'을 훨씬 더 잘 정리하고 빠르게 찾을 수 있게 만들었답니다! 이제 '할 일'들을 순서대로 보고 관리하기가 훨씬 편해질 거예요.

