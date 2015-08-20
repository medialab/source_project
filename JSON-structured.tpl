{strip}
[
  {foreach $results as $r name=mainloop}
    {
      "recordTypeId" : {$r.recTypeID},

      {* Organisation *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="4")}

       "recordId":{$r.recID},
       "shortName":"{$r.f2|escape:'htmlall'|strip}{*Short Name / Acronym*}",
       "name":"{$r.f1|escape:'htmlall'|strip}{*Name Of Organisation*}",
       "type":"{$r.f22.term|escape:'htmlall'|strip}{*Organisation Type >> Term*}",

       "short_description":"{$r.f3|escape:'htmlall'|strip}{*Short Description*}",
       "logo":"{$r.f182}{*Logo*}",
       "url":"{$r.f77}{*URL*}",

       "extendedDescription":"{$r.f4|escape:'htmlall'|strip}{*Extended Description*}",

       "startDate":"{$r.f10}{*Start Date*}",
       "endDate":"{$r.f11}{*End Date*}",

       "contactDetails":"{$r.f17|escape:'htmlall'|strip}{*Contact Details Or URL(s)*}",
       "location": {
         "mappable":"{$r.f134.f28}{*Location (places) >> Location (mappable)*}",
         "country":"{$r.f134.f26.term}{*Country >> Term*}"
         }
      {/if}

      {* Relationship *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="1")}

        "recordId":{$r.recID}{*ID*} ,

        "relationshipTypeId":{$r.recTypeID}{*RecTypeID*} ,
        "relationshipTypeName":"{$r.recTypeName}{*RecTypeName*}",

        "source":{
          "id":{$r.f7.recID}{*Source Record >> ID*},
          "typeId":{$r.f7.recTypeID}{*Source Record >> RecTypeID*},
          "typeName":"{$r.f7.recTypeName}{*Source Record >> RecTypeName*}"
        },

        "target": {
          "id":{$r.f5.recID}{*Target Record >> ID*} ,
          "typeId":{$r.f5.recTypeID}{*Target Record >> RecTypeID*},
          "typeName":"{$r.f5.recTypeName}{*Target Record >> RecTypeName*}"
        },


        "title":"{$r.f1|escape:'htmlall'|strip}{*Title For Relationship*}",
        "description":"{$r.f3|escape:'htmlall'|strip}{*Description*}",

        "startDate":"{$r.f10}{*Start Date/time*}",
        "endDate":"{$r.f11}{*End Date/time*}"
      {/if}

      {* Issue *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="14")}
        "recordId":{$r.recID}{*ID*},
        "title":"{$r.recTitle}{*RecTitle*}",
        "shortSummary":"{$r.f3}{*Short Summary*}"
      {/if}

      {* Event *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="20")}
        "recordId":{$r.recID}{*ID*},
        "title":"{$r.recTitle}{*RecTitle*}"
      {/if}
    }
    {if $smarty.foreach.mainloop.last}{else},{/if}
  {/foreach}
]
{/strip}
