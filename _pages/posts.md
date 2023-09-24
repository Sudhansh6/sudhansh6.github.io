---
layout: default
title: Posts
permalink: /posts/
---
<div id="main" role="main" class="container">
  <p>
  This page contains all projects, notes, and random blogs that I have written. You can give suggestions for the website and the content <a href="{{site.url}}contact/"> here </a>
  </p>
  <br>
  <div class="entry">
      <div id="search-container">
      <input type="text" id="search-input" placeholder="Search through the posts..." />
      <ul id="results-container"></ul>
  </div>

  <script src="/assets/simple-jekyll-search.min.js" type="text/javascript"></script>

  <script>
      SimpleJekyllSearch({
      searchInput: document.getElementById('search-input'),
      resultsContainer: document.getElementById('results-container'),
      searchResultTemplate: '<div style="text-align: left !important;"><a href="{url}"><h1 style="text-align:left !important;">{title}</h1></a></div>',
      json: '/search.json'
      });
  </script>

  <div id = "all_posts" class="posts">
    {% for post in site.posts %}

      <article class="post">
        <a href="{{ site.baseurl }}{{ post.url }}">
          <h1>{{ post.title }}</h1>

          <!-- <div>
            <p class="post_date">{{ post.date | date: "%B %e, %Y" }}</p>
          </div> -->
        </a>
        <div class="entry">
          {{ post.excerpt }}
        </div>

        <a href="{{ site.baseurl }}{{ post.url }}" class="read-more">Read More</a>
      </article>
    {% endfor %}

   </div>
</div>