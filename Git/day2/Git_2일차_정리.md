# Git & GitHub 2일차 정리

> OZ코딩스쿨 AI 헬스케어 부트캠프 6기 / 작성: 조태희
> 과제: 오늘 학습한 내용을 마크다운(.md)으로 정리 → 본인 Public Repository에 push → 레포 링크 제출
> 1일차(개념, 기본 명령어, 브랜치)에 이어 **원격 저장소 협업, 기록 확인, 되돌리기, GitHub 협업 기능, .gitignore, 마크다운**을 정리했다.
> 터미널 출력은 실습용 저장소에서 직접 실행한 결과다.

---

## 1. 원격 저장소(Remote) 연결하기

**원격 저장소**: 인터넷(GitHub)에 있는 저장소. 내 컴퓨터의 **로컬 저장소**와 커밋을 주고받는다. 원격 저장소의 기본 별명은 `origin`.

### 방법 1. 내 폴더에서 시작해서 GitHub에 연결하기

GitHub에서 빈 레포(`oz_assignment`, Public)를 만든 뒤, 내 폴더에서:
```bash
echo "# oz_assignment" >> README.md      # README.md 파일 만들기
git init                                 # 이 폴더를 Git 저장소로 (처음 한 번)
git add README.md                        # 스테이지에 올리기
git commit -m "first commit"             # 첫 커밋
git branch -M main                       # 현재 브랜치 이름을 main으로 (master로 만들어졌을 때 대비)
git remote add origin https://github.com/<아이디>/oz_assignment.git   # 원격 저장소를 origin이라는 이름으로 연결
git push -u origin main                  # main을 올리고, 앞으로 기본 업로드 대상으로 기억
```
```bash
$ git remote -v
origin	https://github.com/<아이디>/oz_assignment.git (fetch)
origin	https://github.com/<아이디>/oz_assignment.git (push)

$ git push -u origin main
To https://github.com/<아이디>/oz_assignment.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

### 방법 2. GitHub에 있는 저장소를 복제하기 (clone)

```bash
git clone https://github.com/<아이디>/oz_assignment.git   # 레포 이름과 같은 폴더가 생기고, origin도 자동으로 연결됨
```

### 원격 관련 명령어 정리

| 명령어 | 하는 일 |
|---|---|
| `git remote -v` | 연결된 원격 저장소 확인 |
| `git remote add origin URL` | 원격 저장소 연결 |
| `git clone URL` | 원격 저장소를 통째로 복제 (이력 포함) |
| `git push` | 내 커밋을 원격으로 올리기 |
| `git fetch` | 원격의 새 커밋을 **가져오기만** (내 작업 파일은 그대로) |
| `git pull` | 가져와서 **내 브랜치에 합치기** (= fetch + merge) |

### fetch와 pull의 차이

**비유**: fetch는 택배를 **현관에 받아만 두는 것**, pull은 받아서 **뜯어 정리까지** 하는 것.

팀원이 먼저 push한 상황에서 실제로 실행한 결과:
```bash
$ git fetch
From https://github.com/<아이디>/oz_assignment
   dbc9273..917ba01  main       -> origin/main     # 원격의 새 커밋을 origin/main으로 받아 둠

$ git status
On branch main
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)

$ git pull
Updating dbc9273..917ba01
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)
```
fetch 후 `git status`로 원격과 얼마나 차이 나는지 먼저 확인하고 pull하면 안전하다.

---

## 2. 기록 살펴보기 (log, show, diff)

| 명령어 | 하는 일 |
|---|---|
| `git log` | 커밋 이력 자세히 보기 (`q`로 빠져나오기) |
| `git log --oneline` | 한 줄에 커밋 하나씩 |
| `git log --oneline --graph --all` | 모든 브랜치의 갈래를 그림으로 |
| `git show` | 가장 최근 커밋의 내용과 변경점 |
| `git show 커밋해시` | 특정 커밋의 내용 |
| `git diff` | 아직 add 안 한 변경 내용 (작업 폴더 vs 스테이지) |
| `git diff --staged` | add 한 변경 내용 (스테이지 vs 마지막 커밋) |

- **`HEAD~n`**: HEAD(현재 위치)에서 n개 전 커밋. `HEAD~1` = 바로 전 커밋 (`HEAD^`와 같음)

```bash
$ git show --stat HEAD
commit 1f34bc42b09533d003010d3384af78fd2fe01449
Author: taehee <taehee@example.com>
Date:   Fri Aug 21 11:00:00 2026 +0900

    feat: 기능 추가(버그 있음)

 app.js | 1 +
 1 file changed, 1 insertion(+)

$ git diff
diff --git a/app.js b/app.js
--- a/app.js
+++ b/app.js
@@ -1,2 +1,3 @@
 v1
 v2 (버그)
+v3                     <- + 는 추가된 줄, - 는 삭제된 줄
```

---

## 3. 되돌리기 (restore, reset, revert, amend)

**상황별로 고르기**

| 상황 | 명령어 | 결과 |
|---|---|---|
| 파일 수정을 취소하고 싶다 (add 전) | `git restore 파일` | 마지막 커밋 상태로 돌아감 (**수정 내용은 사라짐**) |
| add를 취소하고 싶다 | `git restore --staged 파일` | 스테이지에서만 내림 (수정 내용은 유지) |
| 마지막 커밋 메시지·내용을 고치고 싶다 | `git commit --amend` | 마지막 커밋을 새 커밋으로 교체 (**push 전에만**) |
| 커밋을 **기록에서 지우고** 싶다 | `git reset 커밋` | 브랜치 이름표를 과거 커밋으로 옮김 |
| 커밋을 **기록은 남기고** 취소하고 싶다 | `git revert 커밋` | 그 커밋의 반대 내용을 담은 **새 커밋**을 만듦 |

### reset의 3가지 옵션

`git reset HEAD~1` = "커밋 1개를 취소한다." 옵션은 **취소한 변경을 어디까지 남길지** 를 정한다.

| 옵션 | 커밋 기록 | 스테이지 | 작업 폴더(파일 내용) |
|---|---|---|---|
| `--soft` | 취소 | 유지 (변경이 staged 상태로 남음) | 유지 |
| `--mixed` (기본값) | 취소 | 취소 (변경이 unstaged 상태로 남음) | 유지 |
| `--hard` | 취소 | 취소 | **취소 (변경 내용이 사라짐!)** |

```bash
$ git reset --soft HEAD~1
$ git status -s
M  app.js          <- 커밋만 취소되고 변경은 스테이지에 그대로 남아 있음
```

### revert: 공유된 커밋을 안전하게 취소

```bash
$ git revert HEAD --no-edit
[main 0627e4b] Revert "feat: 기능 추가(버그 있음)"
 1 file changed, 1 deletion(-)

$ git log --oneline
0627e4b Revert "feat: 기능 추가(버그 있음)"   <- 취소용 새 커밋이 추가됨
1f34bc4 feat: 기능 추가(버그 있음)            <- 원래 커밋은 기록에 남아 있음
26475a0 feat: app.js 추가
```

> **규칙: 이미 push해서 팀원과 공유한 커밋은 reset이 아니라 revert로 취소한다.**
> reset은 이력 자체를 바꾸기 때문에, 팀원이 가진 이력과 어긋나서 강제 push(`--force`)가 필요해지고 남의 작업을 덮어쓸 위험이 있다.

> 실수로 reset을 했더라도 `git reflog`(HEAD가 움직인 기록)를 보면 이전 커밋 해시를 찾아 되돌아갈 수 있다.

---

## 4. 브랜치 합치기 더 알아보기 (merge 옵션, rebase, cherry-pick)

### merge 옵션

| 명령어 | 결과 |
|---|---|
| `git merge 브랜치` | Fast-forward가 가능하면 이름표만 이동, 아니면 병합 커밋 생성 (기본값) |
| `git merge --no-ff 브랜치` | Fast-forward가 가능해도 **병합 커밋을 만들어** 브랜치 작업 흔적을 남김 |
| `git merge --squash 브랜치` | 브랜치의 여러 커밋을 **하나의 변경으로 뭉쳐 스테이지에만 올림**. 병합 커밋은 만들지 않으므로 이어서 `git commit`을 해야 하고, main에는 일반 커밋 1개로 기록됨 |

### rebase: 커밋을 다른 브랜치 끝으로 옮겨 다시 쌓기

```
rebase 전                              git switch feature → git rebase main 후
        C---D     <- feature                          C'---D'   <- feature
       /                                             /
  A---B---E       <- main                 A---B---E            <- main
```
- feature의 커밋 C, D를 main의 최신 커밋 E 뒤로 **새로 다시 쌓는다** (C', D'는 내용은 같지만 해시가 다른 새 커밋).
- 장점: 갈래 없는 **한 줄짜리 깔끔한 이력**
- 충돌 시: 파일 수정 → `git add` → `git rebase --continue` / 취소는 `git rebase --abort`
- **황금 규칙: 이미 push해서 다른 사람과 공유한 커밋은 rebase하지 않는다.** (커밋이 새로 만들어지므로 팀원의 이력과 어긋난다)

### cherry-pick: 특정 커밋만 골라 가져오기

```bash
git cherry-pick a1b2c3d          # 커밋 하나를 현재 브랜치에 복사 (새 해시로 생성)
git cherry-pick a1b2c3d e4f5g6h  # 여러 개
git cherry-pick A..B             # A 다음부터 B까지 (A 자체는 포함 안 됨, 포함하려면 A^..B)
git cherry-pick --abort          # 충돌 시 취소 / 해결 후에는 --continue
```
- 예) develop에서 고친 버그 수정 커밋 하나만 급하게 main에도 반영하고 싶을 때

---

## 5. GitHub 협업 기능

### Collaborator와 Fork

| 방식 | 의미 | 언제 |
|---|---|---|
| Collaborator | 레포 주인이 팀원을 초대해 **같은 레포에 쓰기 권한**을 줌 → 브랜치를 만들어 push | 팀 프로젝트 |
| Fork | 남의 레포를 **내 계정으로 복사**해서 내 복사본에서 작업 | 권한이 없는 오픈소스에 기여할 때 |

### Pull Request (PR)

**"제 브랜치의 변경을 합쳐 주세요"라는 요청이자, 코드 리뷰를 하는 장소.**
```bash
git switch -c feature/resume-form          # 1. 기능 브랜치 만들기
# ... 작업 ...
git add .                                  # 2. 커밋
git commit -m "feat: 이력서 메일 폼 추가"
git push -u origin feature/resume-form     # 3. 브랜치를 원격에 올리기
```
4. GitHub에서 **Compare & pull request** → 제목과 설명(무엇을, 왜 바꿨는지) 작성
5. 팀원이 리뷰: Comment(의견) / Approve(승인) / Request changes(수정 요청)
6. 승인되면 Merge. GitHub의 병합 방식은 3가지: **Create a merge commit**, **Squash and merge**(커밋을 하나로 합쳐 병합), **Rebase and merge**
7. 내 컴퓨터에서 마무리: `git switch main` → `git pull` → `git branch -d feature/resume-form`

### Issue

- 버그, 할 일, 아이디어를 기록하고 담당자·라벨을 붙여 관리하는 게시판.
- PR 설명에 `Closes #12`처럼 쓰면, 그 PR이 기본 브랜치에 병합될 때 12번 이슈가 자동으로 닫힌다.

### README.md

- 레포 첫 화면에 자동으로 보이는 설명서. 프로젝트 소개, 실행 방법, 사용 기술을 마크다운으로 적는다.

---

## 6. .gitignore

- **정의**: Git이 **추적하지 않을 파일·폴더 목록**을 적는 파일 (레포 최상위에 둠)
- **왜 필요할까?** 비밀 정보(API 키, 비밀번호), 용량 큰 데이터, 자동 생성 파일, 운영체제가 만드는 파일은 올리면 안 되기 때문.

```gitignore
# 비밀 정보 (# 으로 시작하면 주석)
.env

# Python
__pycache__/
*.pyc
.venv/

# Node.js
node_modules/

# 운영체제·에디터가 만드는 파일
.DS_Store
Thumbs.db
.vscode/

# 데이터 (폴더 안의 csv 전부 제외하되, 예시 파일 하나는 포함)
data/*.csv
!data/sample.csv
```
- `*`는 아무 글자, 끝의 `/`는 폴더, `!`는 '예외로 포함'이라는 뜻.
- **이미 커밋된 파일은 .gitignore에 적어도 계속 추적된다.** 추적을 끊으려면 `git rm --cached 파일` 후 커밋한다 (내 컴퓨터의 파일은 지워지지 않음).
- 실수로 API 키를 push했다면, 커밋을 지워도 이력이나 복제본에 남아 있을 수 있으므로 **그 키를 즉시 폐기하고 새로 발급**받는다.
- GitHub에서 레포를 만들 때 언어별 .gitignore 템플릿을 고를 수 있다.

---

## 7. 마크다운(Markdown) 기본 문법

마크다운은 간단한 기호로 문서 서식을 표현하는 문법이다. GitHub의 README, 노션, 블로그에서 널리 쓴다. (이 정리 파일도 마크다운이다)

````markdown
# 제목 1          ## 제목 2          ### 제목 3

**굵게**   *기울임*   ~~취소선~~   `인라인 코드`

- 순서 없는 목록
  - 들여쓰기(스페이스 2칸)로 하위 목록
1. 순서 있는 목록
2. 두 번째

- [x] 끝난 일 (체크박스)
- [ ] 할 일

[링크 글자](https://github.com)
![이미지 설명](images/profile.svg)

> 인용문

---  (가로줄)

| 명령어 | 설명 |
|---|---|
| git add | 스테이지에 올리기 |

```python
print("코드 블록: 백틱 3개 + 언어 이름을 쓰면 문법 강조")
```
````

- 문단을 나누려면 **빈 줄**을 한 줄 넣는다. (그냥 줄바꿈만 하면 한 줄로 이어 붙을 수 있음)
- 체크박스, 취소선, 표는 GitHub 방식 마크다운(GFM)에서 지원하는 문법이다.

---

## 8. 과제 제출: 이 파일을 Public Repository에 push 하기

(Git Bash 또는 macOS 터미널 기준)
```bash
cd ~/Desktop/oz_assignment                  # 과제 레포 폴더로 이동 (위치는 각자 다를 수 있음)
mkdir -p Git/day2                           # 정리 파일을 넣을 폴더 만들기 (-p: 중간 폴더까지 한 번에)
# 이 정리 파일을 Git/day2/ 안에 저장한 뒤
git status                                  # 새 파일이 Untracked로 보이는지 확인
git add Git/day2/
git commit -m "docs: Git 2일차 학습 내용 정리"
git push origin main
```
1. GitHub 레포 페이지에서 파일이 올라갔는지, 마크다운이 제대로 보이는지 확인한다.
2. 레포가 **Public** 인지 확인한다 (Settings → General → Danger Zone에서 공개 여부 변경 가능).
3. 레포 링크를 노션 과제 제출란에 첨부하고, 노션 링크를 LMS에 제출한다.
