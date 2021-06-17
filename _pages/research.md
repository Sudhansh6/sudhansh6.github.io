---
layout: page
permalink: /categories/research
title: Research
---


<div id="archives">
{% for category in site.categories %}
{% capture category_name %}{{ category | first }}{% endcapture %}
{% if category_name == "Research" %}
  <div class="archive-group">
    <p></p>
    <a name="{{ category_name | slugize }}"></a>
    {% for post in site.categories[category_name] %}
    <article class="archive-item">
      <h4><a href="{{ site.baseurl }}{{ post.url }}">{% if post.title and post.title != "" %}{{post.title}}{% else %}{{post.excerpt |strip_html}}{%endif%}</a></h4>
    </article>
    {% endfor %}
  </div>
{% endif %}
{% endfor %}
</div>
