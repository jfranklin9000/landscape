::
::::
  ::
/?  309
/+  collections, cram
::
::
|=  [shp=@p col=@da post=@da]
=/  itm  *item:collections
::
=<  (item-to-elem itm)
|%
++  item-to-elem
  !:
  |=  itm=item:collections
  ^-  manx
  ;div.container
    ;+
      ?+    -.itm  !!
          %error  ;div: 505
        ::
          %collection
            ;div.row
              ;div.flex-col-2;
              ;div.flex-col-x
                ;div.collection-index
                  ;+  (meta-to-elem itm)
                  ;+  (collection-to-elem col.itm)
                ==
              ==
              ;+  ?:  =(type.meta.col.itm %blog)
                    ;div.flex-col-5;
                  ?:  =(type.meta.col.itm %fora)
                    ;div.flex-col-4;
                  ;div.flex-col-4;
            ==
        ::
::        %raw
      ::
          %both
            ;div.row
              ;div.flex-col-2;
              ;div.flex-col-x
                ;div.collection-index
                  ;+  (meta-to-elem itm)
                  ;+  (both-to-elem col.itm raw.itm)
                ==
              ==
              ;div.flex-col-3;
            ==
        ::
      ==
  ==
++  collection-to-elem
  |=  col=collection:collections
  ^-  manx
  ;ul.vanilla
    ;*  %+  roll
          %+  sort  ~(tap by data.col)
          |=  [[knot a=item:collections] [knot b=item:collections]]
          =/  a-dat  (extract-date-created a)
          =/  b-dat  (extract-date-created b)
          (lth a-dat b-dat)
        |=  [[nom=knot ite=item:collections] out=marl]
        ^-  marl
        ?:  ?=(%error -.ite)
          out
        :_  out
        ^-  manx
        ;li.collection-post.mt-6
          ;+  (item-to-snip nom ite)
        ==
  ==
::
++  raw-to-elem
  |=  raw=raw-item:collections
  ^-  manx
  =/  elm  elm:(static:cram (ream data.raw))
  =/  ht  (hedtal:collections +.elm)
  =/  title  (fall (~(get by meta.raw) %name) /spur)
  =/  date   (fall (~(get by meta.raw) %date-created) 'missing date')
  =/  author  (fall (~(get by meta.raw) %author) 'anonymous')
  ::
  ;div.mb-18.mt-4
    ;+  elm
  ==
::
++  both-to-elem
  |=  [col=collection:collections raw=raw-item:collections]
  ^-  manx
  ;div
    ;+  (raw-to-elem raw)
    ::
    ;div
      ;div.flex.align-center.mb-5
        ;div(urb-component "IconComment");
        ;div.ml-2.text-small.text-mono.text-600: {<~(wyt by data.col)>}
      ==
      ::
      ;ul.vanilla
      ;*  %+  turn
            %+  sort  ~(tap by data.col)
            |=  [[knot a=item:collections] [knot b=item:collections]]
            =/  a-dat  (extract-date-created a)
            =/  b-dat  (extract-date-created b)
            (lte a-dat b-dat)
          |=  [nom=knot ite=item:collections]
          ^-  manx
          ?>  ?=(%raw -.ite)
          =/  author  (fall (~(get by meta.raw.ite) %author) 'anonymous')
          =/  host  (fall (~(get by meta.raw.ite) %host) 'anonymous')
          =/  date  (fall (~(get by meta.raw.ite) %date-created) 'missing date')
          ;li.mb-6
            ;div.flex.align-center
              ;div.mr-2
                =urb-component  "Sigil"
                =urb-ship       "{(trip author)}"
                =urb-size       "18"
                =urb-suffix     "true";
              ;div
                ;a.vanilla.text-mono.text-small.text-700.mr-4
                  =href  "/~~/{(trip host)}/==/web/landscape/profile"
                  ; {(trip author)}
                ==
              ==
              ;div.text-host-breadcrumb
                =urb-component  "Elapsed"
                =urb-timestring  "{(trip date)}";
            ==
            ;div.collection-comment-content
              ;+  elm:(static:cram (ream data.raw.ite))
            ==
          ==
      ==
      ::
      ;div
        =urb-component  "CommentCreate"
        =urb-pax        "{<(flop /spur)>}"
        =urb-ship       "{<shp>}";
    ==
  ==
::
++  extract-date-created
  |=  i=item:collections
  ^-  @da
  ?-  -.i
    %error       *@da
    %collection  date-created.meta.col.i
    %both        date-created.meta.col.i
    %raw         (slav %da (~(got by meta.raw.i) %date-created))
  ==
::
::
::
++  item-to-snip
  |=  [nom=knot itm=item:collections]
  ^-  manx
  ?-    -.itm
      %error
    ;div: 404
      %collection
    (collection-to-snip nom col.itm)
      %raw
    (raw-to-snip nom raw.itm)
      %both
    (both-to-snip nom col.itm raw.itm)
  ==
::
++  collection-to-snip
  |=  [nom=knot col=collection:collections]
  ^-  manx
  =/  lnk=tape
    "/~~/{(scow %p p.full-path.meta.col)}/=={(spud (flop (slag 1 s.full-path.meta.col)))}"
  ;div
    ;div.collection-date: {<date-created.meta.col>}
    ;h2.mt-0.mb-0
      ;a(href lnk): {(trip name.meta.col)}
    ==
    ;div.who.text-mono.text-600: {<author.meta.col>}
    ;div.meta-cont
      ;div.com-count.ml-12
        ; {(trip (scot %ud ~(wyt by data.col)))} comments
      ==
    ==
  ==
::
++  raw-to-snip
  |=  [nom=knot raw=raw-item:collections]
  ^-  manx
  =/  elm=manx  elm:(static:cram (ream data.raw))
  =/  ht  (hedtal:collections +.elm)
  =?  tal.ht  ?=(~ hed.ht)
    (scag 5 c.elm)
  =/  title  (fall (~(get by meta.raw) %name) nom)
  =/  date   (fall (~(get by meta.raw) %date-created) 'missing date')
  =/  author  (fall (~(get by meta.raw) %author) 'anonymous')
  =/  lnk=tape
    "/~~/{<shp>}/=={(spud (flop /spur))}/{(trip nom)}"
  ::
  ;div
    ;div.collection-date: {(trip date)}
    ;h2
      ;+  ?~  hed.ht
            ;a(href lnk): {(trip title)}
          ;a(href lnk): *{hed.ht}
    ==
    ;div.who.text-mono.text-600: {(trip author)}
    ;div.snippet
      ;*  tal.ht
    ==
  ==
::
++  both-to-snip
  |=  [nom=knot col=collection:collections raw=raw-item:collections]
  ^-  manx
  =/  elm=manx  elm:(static:cram (ream data.raw))
  =/  ht  (hedtal:collections +.elm)
  =?  tal.ht  ?=(~ hed.ht)
    (scag 5 c.elm)
  =/  title  (fall (~(get by meta.raw) %name) nom)
  =/  lnk=tape
    "/~~/{<shp>}/=={(spud (flop /spur))}/{(trip nom)}"
  ::
  ;div
    ;div.collection-date: {<date-created.meta.col>}
    ;h2.mt-0.mb-0.text-500
      ;+  ?~  hed.ht
            ;a(href lnk): {(trip title)}
          ;a(href lnk): *{hed.ht}
    ==
    ;div.text-mono.text-small.text-300.mt-1.mb-1: {<author.meta.col>}
    ;div
      ;div.icon-label.justify-start
        ;div(urb-component "IconComment");
        ;div.ml-2
          ; {(trip (scot %ud ~(wyt by data.col)))}
        ==
      ==
    ==
  ==
::
++  meta-to-elem
  |=  itm=item:collections
  ^-  manx
  =/  mat=mart
    :~  [%type "hidden"]
        [%name "urb-metadata"]
        [%urb-path (spud (flop /spur))]
    ==
  :_  ~
  :-  %input
  %+  weld  mat
  ^-  mart
  ?-    -.itm
      %error  ~
      %collection
    =*  met  meta.col.itm
    :~  [%urb-name (trip name.met)]
        [%urb-author (scow %p author.met)]
        [%urb-host (scow %p p.full-path.met)]
        [%urb-date-created (scow %da date-created.met)]
        [%urb-last-modified (scow %da last-modified.met)]
        [%urb-content-type (trip type.met)]
        [%urb-structure-type "collection-index"]
    ==
      %raw
    =/  met  ~(got by meta.raw.itm)
    :~  [%urb-name (trip (met %name))]
        [%urb-author (trip (met %author))]
        [%urb-host (trip (met %host))]
        [%urb-date-created (trip (met %date-created))]
        [%urb-last-modified (trip (met %last-modified))]
        [%urb-content-type (trip (met %type))]
        [%urb-structure-type "collection-post"]
    ==
      %both
    =/  met  ~(got by meta.raw.itm)
    :~  [%urb-name (trip (met %name))]
        [%urb-author (trip (met %author))]
        [%urb-host (trip (met %host))]
        [%urb-date-created (trip (met %date-created))]
        [%urb-last-modified (trip (met %last-modified))]
        [%urb-content-type (trip (met %type))]
        [%urb-structure-type "collection-post"]
    ==
  ==
--
