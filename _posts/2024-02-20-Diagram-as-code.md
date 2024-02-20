---
layout: post
date: 2024-02-20
title: "Diagram as code"
tags: [Diagram, ]
categories: [Diagram, ]
pin: true
---


# **Diagram as Code**


[https://diagrams.mingrammer.com/](https://diagrams.mingrammer.com/)


다이어그램을 사용하면 Python 코드로 클라우드 시스템 아키텍처를 그릴 수 있습니다.


코드형 다이어그램을 사용하면 모든 버전 관리 시스템에서 아키텍처 다이어그램 변경 사항을 추적할 수 있습니다.


Example)


![0](/assets/img/2024-02-20-Diagram-as-code.md/0.png)


# GoDiagram


[https://godiagram.com/winforms/latest/index.html](https://godiagram.com/winforms/latest/index.html)


대화형 다이어그램을 빠르게 구축할 수 있는 .NET 라이브러리


# Mermaid


[https://mermaid.js.org/syntax/examples.html](https://mermaid.js.org/syntax/examples.html)


마크다운에서 영감을 받아 텍스트 정의를 렌더링하여 다이어그램을 동적으로 생성하고 수정할 수 있는 JavaScript 기반 다이어그램 및 차트 도구


다른 tool에 plugin 형태로 많이 사용되고 있어 문서간 접합이 용이하다. plantUML과 


Flowchart, Sequence Diagram, Class Diagram, State Diagram 등등 다양한 digram을 코드로 그릴 수 있다.


특히 Gitgraph Diagrams을 이용하면 git flow도 코드로 그릴 수 있다.


![1](/assets/img/2024-02-20-Diagram-as-code.md/1.png)


차트도 그릴 수 있다.


![2](/assets/img/2024-02-20-Diagram-as-code.md/2.png)


# PlantUML


[https://plantuml.com/ko/](https://plantuml.com/ko/)


Mermaid과 마찬가지로 다양한 diagram을 code로 작성할 수 있다


# ASCII diagram editors


[https://asciiflow.com/#/](https://asciiflow.com/#/)


[https://monodraw.helftone.com/](https://monodraw.helftone.com/)


다이어그램을 ASCII문자로 그려주는 툴


![3](/assets/img/2024-02-20-Diagram-as-code.md/3.png)


![4](/assets/img/2024-02-20-Diagram-as-code.md/4.png)


CLI 프로그램 대문을 멋지게 만들 수 있다.


# MarkMap


[https://markmap.js.org/](https://markmap.js.org/)


Mind map을 code로 작성. vscode plugin도 존재한다


{% raw %}
```bash
---
markmap:
  colorFreezeLevel: 2
---

# markmap

## Links

- [Website](https://markmap.js.org/)
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap) for Neovim
- [markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) for VSCode
- [eaf-markmap](https://github.com/emacs-eaf/eaf-markmap) for Emacs

## Features

Note that if blocks and lists appear at the same level, the lists will be ignored.

### Lists

- **strong** ~~del~~ *italic* ==highlight==
- `inline code`
- [x] checkbox
- Katex: $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$ <!-- markmap: fold -->
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text based on `maxWidth` option

### Blocks

```
{% endraw %}js
console('hello, JavaScript')
{% raw %}
```

| Products | Price |
|-|-|
| Apple | 4 |
| Banana | 2 |

![5](/assets/img/2024-02-20-Diagram-as-code.md/5.png)
```
{% endraw %}


![6](/assets/img/2024-02-20-Diagram-as-code.md/6.png)

