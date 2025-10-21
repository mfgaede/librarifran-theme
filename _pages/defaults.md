---
title: "Defaults"
permalink: /defaults/
layout: single
classes: wide
---

{% assign current_apps = site.apps | where_exp: "app", "app.former != true" | sort: "category" %}
{% include app_row.html apps=current_apps %}

## Former Defaults

{% assign former_apps = site.apps | where: "former", true | sort: "category" %}
{% include app_row.html apps=former_apps %}

### Notes on Former Defaults - 2024-03-08

✅ **To-Do**: Digital planner from [Emma Studies](https://emmastudies.com/) (personal): My iPad has been turned into a cross-stitch pattern manager and I have stopped carrying it with me. Not missing it at the moment, but I adore Emma's work and if you're interested in digital planning that is a bit more evocative of physical planning (think fun fonts, stickers, etc.), I'd recommend checking out her work.  
