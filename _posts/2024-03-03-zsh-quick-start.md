---
layout: post
date: 2024-03-03
title: "zsh quick start"
tags: [zsh, ]
categories: [zsh, ]
pin: true
---


# Install


{% raw %}
```bash
id=$(whoami)
sudo apt install wget curl git
sudo apt install zsh
sudo chsh -s $id $(which zsh)

```
{% endraw %}


# oh-my-zsh


## 설치


{% raw %}
```bash
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
```
{% endraw %}


## theme 변경


{% raw %}
```bash
vim ~/.zshrc

ZSH_THEME="agnoster”
```
{% endraw %}


## font 설정


{% raw %}
```bash
sudo apt install fonts-powerline
```
{% endraw %}


### cf) 윈도우


{% raw %}
```bash
git clone https://github.com/powerline/fonts.git
cd fonts/DroidSansMono
& '.\Droid Sans Mono for Powerline.otf'
```
{% endraw %}


이후 terminal font를 powerline으로 변경


![0](/assets/img/2024-03-03-zsh-quick-start.md/0.png)


## 주요 plugin 설정 


(이후 ctrl + r로 기능 확인 가능)


{% raw %}
```bash
# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# fzf (Fuzzy Finder )
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```
{% endraw %}


# 완성


![1](/assets/img/2024-03-03-zsh-quick-start.md/1.png)


# 참고 링크


[https://log4cat.tistory.com/7](https://log4cat.tistory.com/7)

