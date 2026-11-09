# Git & GitHub 1일차 정리

> OZ코딩스쿨 AI 헬스케어 부트캠프 6기 / 작성: 조태희
> 순서: 1. Git / GitHub → 2. git 기본 명령어 → 3. Branch
> 터미널 출력은 실습용 저장소에서 직접 실행한 결과다. (Git 언어 설정에 따라 한국어로 나올 수도 있다)

---

## 1. Git / GitHub

### Git & GitHub를 사용해야하는 이유

**비유로 먼저**: 게임의 **세이브 포인트**. 중요한 순간마다 저장해 두면, 실수해도 그 시점으로 돌아갈 수 있다.
Git이 없으면 `보고서_최종.py`, `보고서_진짜최종.py`, `보고서_진짜최종_수정.py`처럼 파일이 늘어나고, 무엇이 언제 왜 바뀌었는지 알 수 없다.

- **버전 관리**: 누가, 언제, 무엇을, 왜 바꿨는지 기록이 남고, 언제든 이전 상태로 되돌릴 수 있다.
- **협업**: 여러 사람이 각자 브랜치에서 동시에 작업한 뒤 합칠(merge) 수 있다.
- **백업**: GitHub에 올려 두면 내 컴퓨터가 고장 나도 코드가 남는다.
- **코드 리뷰**: Pull Request로 팀원이 코드를 검토하고 의견을 남길 수 있다.
- **포트폴리오**: 공개 저장소와 커밋 기록이 곧 나의 개발 이력이 된다.
- **자동화**: 코드를 올리면 테스트·배포가 자동으로 돌게 할 수 있다(GitHub Actions 등).

### Git과 GitHub의 차이

**비유**: Git은 **내 컴퓨터에 설치하는 '세이브 기능'**, GitHub는 **세이브 파일을 올려 두고 친구와 공유하는 '클라우드'**.

| 구분 | Git | GitHub |
|---|---|---|
| 정체 | 분산 버전 관리 시스템(프로그램) | Git 저장소를 인터넷에 올려 관리하는 웹 서비스(플랫폼) |
| 위치 | 내 컴퓨터(로컬)에 설치 | 인터넷(원격) |
| 인터넷 | 없어도 커밋·브랜치 작업 가능 | 필요 |
| 핵심 기능 | commit, branch, merge, log | 원격 저장소, Pull Request, Issue, Actions |
| 만든 곳 | 2005년 리누스 토르발스 (리눅스 커널 개발용) | 2008년 서비스 시작, 2018년 마이크로소프트가 인수 |
| 비슷한 것 | SVN 등 다른 버전 관리 도구 | GitLab, Bitbucket |

- **분산형**이라는 말은 모든 사람이 **전체 이력의 복사본**을 각자 컴퓨터에 갖고 있다는 뜻이다. 그래서 서버가 없어도 작업할 수 있고, 나중에 GitHub와 동기화하면 된다.

### Repository

- **저장소(Repository, 레포)**: 프로젝트 파일과 그 **변경 이력 전체**를 담는 공간.
- **로컬 저장소**(내 컴퓨터) vs **원격 저장소**(GitHub). 원격 저장소의 기본 별명은 보통 `origin`이다.
- `git init`을 하면 생기는 숨김 폴더 **`.git`이 저장소의 본체**다. 모든 커밋·브랜치 정보가 여기 들어 있어서 지우면 이력이 사라진다. 프로젝트 **최상위 폴더에 하나만** 있어야 한다.

**Git의 3가지 작업 영역** (가장 중요한 그림)
```
 Working Directory  --git add-->  Staging Area  --git commit-->  Repository(.git)  --git push-->  원격 저장소(GitHub)
 (내가 수정하는 폴더)              (커밋할 것을 담는 장바구니)     (확정된 기록)                     
```
- **Staging Area(스테이지, 인덱스)** 를 장바구니라고 생각하면 쉽다. 바뀐 파일 중 **이번 커밋에 넣을 것만 골라 담는** 단계라서, 의미 있는 단위로 커밋을 나눌 수 있다.

**파일의 상태**
- Untracked: Git이 아직 관리하지 않는 새 파일
- Tracked: Git이 관리 중인 파일 → Unmodified(변경 없음) / Modified(수정됨) / Staged(스테이지에 올라감)

### Commit

- **정의**: 스테이지에 담긴 변경 사항을 **하나의 스냅샷(사진)으로 확정해 저장한 기록**. 세이브 포인트 1개.
- 커밋에는 변경 내용(스냅샷), 작성자, 날짜, **메시지**, 직전 커밋(부모)을 가리키는 정보가 담긴다.
- 커밋마다 **고유한 해시값**(16진수 ID)이 붙는다. 보통 앞 7자리로 줄여서 보여준다. 예) `cebd51b`
- **좋은 커밋 습관**
  - 하나의 커밋에는 **하나의 의미 있는 변경**만 담는다.
  - 메시지는 무엇을 왜 바꿨는지 알 수 있게 쓴다. 팀에서 자주 쓰는 접두사 규칙:
    `feat:` 기능 추가, `fix:` 버그 수정, `docs:` 문서, `style:` 서식(동작 변화 없음), `refactor:` 구조 개선, `test:` 테스트, `chore:` 기타 설정

### Branch

- **비유**: **평행 세계**. 원본(main)은 그대로 둔 채, 갈라진 세계에서 마음껏 실험하고, 잘 되면 원본에 합친다.
- **정의**: 브랜치는 특정 커밋을 가리키는 **움직이는 이름표(포인터)** 다. 새 커밋을 하면 이름표가 새 커밋으로 따라 움직인다.
- **HEAD**: '지금 내가 작업 중인 위치(브랜치)'를 가리키는 특별한 포인터.
- **왜 쓸까?** 새 기능 개발이나 버그 수정을 main과 분리해서 안전하게 작업하고, 완성되면 merge로 합치기 위해서.
```
          C---D        <- feature/login (기능 개발 중)
         /
  A---B---E            <- main (안정 버전)
```

---

## 2. git 기본 명령어

작업의 기본 흐름: **(처음 한 번) config → init / (매번) 수정 → status → add → commit → push / (시작 전) pull**

### git config

Git에 **"커밋하는 사람이 누구인지"** 알려주는 설정. 컴퓨터마다 처음 한 번만 하면 된다.
```bash
git config --global user.name "GitHub 이름"         # 커밋 작성자 이름
git config --global user.email "GitHub 이메일"      # 커밋 작성자 이메일
git config --global init.defaultBranch main         # 새 저장소의 기본 브랜치 이름을 main으로
git config --list                                   # 설정 전체 확인
git config user.name                                # 특정 설정만 확인
```
- `--global`: 내 컴퓨터의 모든 저장소에 적용 / 옵션 없이 쓰면 **현재 저장소에만** 적용
- 이메일을 GitHub 계정 이메일과 같게 해야 GitHub에서 커밋이 내 계정과 연결된다(잔디가 심어진다).

### git init

현재 폴더를 **Git 저장소로 만든다** (`.git` 폴더 생성).
```bash
$ git init
Initialized empty Git repository in ~/oz_assignment/.git/
```
- 한 프로젝트에서 **딱 한 번만** 실행한다.
- 홈 폴더나 바탕화면 전체처럼 엉뚱한 상위 폴더에서 실행하지 않도록 `pwd`로 위치를 먼저 확인한다.

### git status

저장소의 **현재 상태**(어느 브랜치인지, 어떤 파일이 바뀌었고 스테이지에 올라갔는지)를 보여준다. 헷갈리면 언제든 먼저 쳐 보는 명령어.
```bash
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	index.html

nothing added to commit but untracked files present (use "git add" to track)
```
- `git status -s`: 짧게 보기. `??` 추적 안 됨, `A` 새로 스테이지에 올림, `M` 수정됨

### git add

변경된 파일을 **스테이지(장바구니)에 담는다.**
```bash
git add index.html        # 특정 파일
git add day1/             # 특정 폴더 안의 변경 전부
git add .                 # 현재 폴더 아래의 모든 변경 (새 파일 포함)
```
```bash
$ git add index.html
$ git status -s
A  index.html
```
- `git add .`은 **새로 만든(untracked) 파일까지** 스테이지에 올린다. 올리고 싶지 않은 파일은 `.gitignore`에 적어 둔다.
- 실수로 올렸다면 `git restore --staged 파일명`으로 내린다.

### git commit

스테이지에 담긴 내용을 **기록(커밋)으로 확정**한다.
```bash
$ git commit -m "feat: 첫 페이지 추가"
[main (root-commit) cebd51b] feat: 첫 페이지 추가
 1 file changed, 1 insertion(+)
 create mode 100644 index.html
```
- `main`: 커밋된 브랜치, `root-commit`: 저장소의 첫 커밋, `cebd51b`: 커밋 해시(앞 7자리)
- `git commit`만 치면 메시지를 쓰는 편집기가 열린다.
- `git commit -am "메시지"`: 이미 추적 중인 파일의 수정분을 add와 commit을 한 번에 (새 파일은 포함 안 됨)
- `git log --oneline`으로 커밋 목록을 확인한다.

### git push

내 컴퓨터의 커밋을 **원격 저장소(GitHub)로 올린다.**
```bash
git remote add origin https://github.com/<아이디>/oz_assignment.git   # 원격 저장소 연결 (처음 한 번)
git push -u origin main     # 처음: main 브랜치를 올리고 '기본 업로드 대상'으로 기억(-u)
git push                    # 그 다음부터는 이것만
```
```bash
$ git push -u origin main
To https://github.com/<아이디>/oz_assignment.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```
- 원격에 내가 모르는 새 커밋이 있으면 push가 거절(rejected)된다 → 먼저 `git pull`로 받아서 합친 뒤 다시 push한다.

### git pull

원격 저장소의 새 커밋을 **받아와서 내 브랜치에 합친다.** `git pull` = `git fetch`(가져오기) + `git merge`(합치기)
```bash
$ git pull
Updating dbc9273..917ba01
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)
```
- 팀 작업에서는 **작업 시작 전에 pull** 하는 습관이 충돌을 줄인다.
- 내 쪽과 원격 쪽에 서로 다른 새 커밋이 있으면, 최신 Git은 합치는 방법(merge 또는 rebase)을 정하라는 안내를 띄울 수 있다. 처음에는 `git config --global pull.rebase false`(merge 방식)로 설정해 두면 된다.

---

## 3. Branch

### git branch 명령어

| 명령어 | 하는 일 |
|---|---|
| `git branch` | 브랜치 목록 (`*`가 현재 브랜치) |
| `git branch -a` | 원격 브랜치까지 모두 보기 |
| `git branch 이름` | 새 브랜치 만들기 (이동은 안 함) |
| `git switch 이름` (= `git checkout 이름`) | 그 브랜치로 이동 |
| `git switch -c 이름` (= `git checkout -b 이름`) | 만들면서 바로 이동 |
| `git branch -m 새이름` | 현재 브랜치 이름 바꾸기 |
| `git branch -d 이름` | 병합이 끝난 브랜치 삭제 (`-D`는 강제 삭제) |
| `git merge 이름` | **현재 브랜치에** 그 브랜치를 합치기 |
| `git push -u origin 이름` | 브랜치를 원격에 올리기 |
| `git log --oneline --graph --all` | 브랜치 갈래를 그림으로 보기 |

- `git switch`는 Git 2.23에서 브랜치 이동 전용으로 생긴 명령어다. `checkout`은 하는 일이 많아서(파일 되돌리기 등) 헷갈리기 쉽기 때문이다.

### 브랜치 관리(main, develop, feature, hotfix, release)

대표적인 브랜치 전략인 **Git Flow** 의 브랜치 5종류.

| 브랜치 | 역할 | 어디서 만들고 | 어디로 합치나 |
|---|---|---|---|
| `main` | **배포된(출시된) 안정 버전**. 버전 태그(v1.0.0 등)를 붙임 | - | - |
| `develop` | 다음 출시를 위해 개발 중인 기능이 모이는 통합 브랜치 | main | (release를 거쳐 main) |
| `feature/*` | 새 기능 하나 개발. 예) `feature/login` | develop | develop |
| `release/*` | 출시 준비(버그 수정, 버전 번호·문서 정리) | develop | main **과** develop |
| `hotfix/*` | 운영 중 발견된 **긴급 버그** 수정 | main | main **과** develop |

```
feature :  develop --(분기)--> feature/login --(병합)--> develop
release :  develop --(분기)--> release/1.0   --(병합)--> main (v1.0 태그)   + develop
hotfix  :  main    --(분기)--> hotfix/1.0.1  --(병합)--> main (v1.0.1 태그) + develop
```
- release와 hotfix를 **develop에도 합치는 이유**: 거기서 고친 버그 수정이 다음 개발 버전에서도 빠지지 않게 하기 위해서다.
- 팀이 작거나 자주 배포하면 더 단순한 **GitHub Flow**(main + 기능 브랜치 + Pull Request)를 많이 쓴다.

### Fast-forward

- **상황**: main에서 feature 브랜치를 만든 뒤, **main에는 새 커밋이 없고 feature에만 커밋이 쌓인** 경우.
- 이때 merge하면 새 커밋을 만들 필요 없이 **main 이름표를 feature의 최신 커밋으로 '앞으로 감기'** 만 하면 된다. (테이프를 빨리 감는 것과 같아서 Fast-forward)
```
병합 전                         병합 후 (git switch main → git merge feature/intro)
  A---B          <- main          A---B---C    <- main, feature/intro
       \
        C        <- feature/intro
```
실제 실행 결과:
```bash
$ git merge feature/intro
Updating 6f70d3d..7302ba9
Fast-forward
 notes.txt | 1 +
 1 file changed, 1 insertion(+)
```
- `git merge --no-ff 브랜치`: Fast-forward가 가능해도 **일부러 병합 커밋을 만든다** → "여기서 기능 브랜치를 합쳤다"는 흔적이 이력에 남는다.
- `git merge --ff-only 브랜치`: Fast-forward가 안 되면 병합을 거부한다.

### 3-way merge

- **상황**: 브랜치가 갈라진 뒤 **양쪽 모두에 새 커밋이 생긴** 경우. 이름표만 옮겨서는 해결이 안 된다.
- Git은 **3개의 커밋**을 비교한다: **공통 조상(base)**, **내 브랜치의 최신 커밋**, **합칠 브랜치의 최신 커밋**
- 판단 규칙: base와 비교해 **한쪽만 바꾼 부분은 바꾼 쪽을 채택**, **양쪽이 같은 부분을 다르게 바꾸면 충돌**

| 줄 | base(공통 조상) | main | feature | 결과 |
|---|---|---|---|---|
| A줄 | line A | line A | line A (feature) | feature 채택 (feature만 바꿈) |
| C줄 | line C | line C (main) | line C | main 채택 (main만 바꿈) |
| B줄 | line B | B를 main 방식으로 수정 | B를 feature 방식으로 수정 | **충돌** → 사람이 결정 |

- **왜 '3'-way일까?** 두 파일만 비교하면 다른 줄을 '누가 바꿨는지' 알 수 없다. 공통 조상이라는 **기준점**이 있어야 바꾼 쪽을 판단할 수 있다.
- 결과로 **부모가 2개인 병합 커밋(merge commit)** 이 생긴다.
```bash
$ git merge feature/style
Auto-merging notes.txt
Merge made by the 'ort' strategy.
 notes.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git log --oneline --graph --all
*   da9b07a Merge branch 'feature/style'    <- 부모가 2개인 병합 커밋
|\
| * c3af164 style: A 수정                    <- feature 쪽 커밋
* | 778831b fix: C 수정                      <- main 쪽 커밋
|/
* 7302ba9 feat: D 추가                       <- 공통 조상(base)
```
(`ort`는 최신 Git의 기본 병합 방식 이름이다.)

### Merge conflict

- **원인**: 두 브랜치가 **같은 파일의 같은 부분을 서로 다르게** 수정했을 때. Git이 어느 쪽이 맞는지 판단할 수 없어서 사람에게 묻는 것이다. (오류가 아니라 정상적인 확인 절차)
```bash
$ git merge feature/title
Auto-merging notes.txt
CONFLICT (content): Merge conflict in notes.txt
Automatic merge failed; fix conflicts and then commit the result.

$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   notes.txt
```
충돌난 파일을 열면 Git이 표시해 둔 **충돌 마커**가 보인다:
```
<<<<<<< HEAD
line B - main에서 수정              <- 현재 브랜치(main)의 내용
=======
line B - 기능 브랜치에서 수정        <- 합치려는 브랜치(feature/title)의 내용
>>>>>>> feature/title
```
**해결 순서**
1. `git status`로 충돌난 파일(both modified)을 확인한다.
2. 파일을 열어 최종 내용으로 고치고 `<<<<<<<`, `=======`, `>>>>>>>` 마커를 모두 지운다. (VS Code에서는 Accept Current / Incoming / Both 버튼으로 고를 수 있다)
3. `git add 파일명` → "이 파일 해결했어요" 표시
4. `git commit` → 병합 커밋 완성
- 병합 자체를 취소하고 싶으면 `git merge --abort`

**충돌을 줄이는 습관**: 작업 전 `git pull`, 작게 자주 커밋, 같은 파일을 동시에 고치지 않도록 역할 나누기
