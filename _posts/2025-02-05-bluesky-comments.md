---
title: "BlueSky Comments as a Minimal Mistakes Custom Comment Provider for Jekyll"
date: 2025-02-05 09:00 AM
classes: single
categories: [posts]
bluesky_post_uri: "https://bsky.app/profile/librarifran.com/post/3lhifudavc22e"
---

I've wanted a comments system for several years, but Discus has way too many privacy issues and I had a knee-jerk "not GitHub!" to utteranc.es and its ilk.  

Last night, I found [Cory Zoe's 5 minute guide to adding BlueSky-powered comments to any website.](https://www.coryzue.com/writing/bluesky-comments/) It, er, took me significantly longer than five minutes to implement, but it is looking and functioning the way I want it to and I think I understand it well enough to be able to explain it to those like me who couldn't dream of doing this from scratch, but know enough to want to implement it and break it terribly and repeatedly.  

First step is to install the library:

{% include codeHeader.html %}

~~~console
    npm install bluesky-comments
~~~

I moved the folder (node_modules) into the assets folder, so now I have my_folder/assets/node_modules.

In my _config.yml file, I turned on comments for posts:

{% include codeHeader.html %}

~~~yaml
    defaults:
        - scope:
            path: ""
            type: "posts"
        values:
            layout: single
            comments: true
~~~

And I set my comments provider to "custom"

{% include codeHeader.html %}

~~~yaml
    comments:
        provider: "custom"
~~~

In the _layouts/single.html from Minimal Mistakes, comments are located on lines 68-76. I wanted them to appear after the date but before the previous / next navigation buttons, so I moved them to `<footer class="page__meta>`.  

Comments are disabled on test servers by Minimal Mistakes, so I removed that bit. If you want to re-enable it, you'll want to wrap the `<div>` in

{% include codeHeader.html %}

~~~liquid
    {% raw %}{% if page.comments %}
        <div class="page__comments">
            {% include comments-providers/custom.html %}
        </div>
    {% endif %}{% endraw %}
~~~

I added the CSS to _includes/head/custom.html:

{% include codeHeader.html %}

~~~html
    <link rel="stylesheet" href="https://unpkg.com/bluesky-comments@0.9.0/dist/bluesky-comments.css">
~~~

I used Cory Zoe's code as a base and used Claude in Copilot to develop _includes/comment-providers/custom.html. Before you use this, make sure you update your username! It's in big friendly letters "YOUR.USERNAME.HERE"

<script src="https://gist.github.com/mfgaede/1dadb849bb362f7364db7eb248dc7343.js"></script>

For comments to show up, you need to include

{% include codeHeader.html %}

~~~yaml
    bluesky_post_uri: "https://bsky.app/profile/YOUR.USERNAME.HERE.bsky.social/post/POSTIDHERE"
~~~

in the YAML for your post. If there is no URI, nothing will show. If there is no post activity, the comments section, but look like this (with your colors, fonts, etc.):

{% include figure image_path="/assets/img/comment_shot.png" %}
