{strip}
[
  {foreach $results as $r name=mainloop}
    {
      "recordId":{$r.recID}{*ID*} ,
      "recordTypeId" : {$r.recTypeID},
      "recordTypeName":"{$r.recTypeName}{*RecTypeName*}",

      {if ($r.f10)}
        "startDate":{$r.f10|regex_replace:'/(.*)([0-9][0-9][0-9][0-9])(.*)$/':'$2'}{*Start Date/time*},
      {/if}

      {if ($r.f11)}
        "endDate":{$r.f11|regex_replace:'/(.*)([0-9][0-9][0-9][0-9])(.*)$/':'$2'}{*End Date*},
      {/if}


      {* Organisation *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="4")}

       "shortName":"{$r.f2|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Name / Acronym*}",
       "name":"{$r.f1|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Name Of Organisation*}",

       "typeName":"{$r.f22.term|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Organisation Type >> Term*}",
       "typeId":{$r.f22.internalid}{*Organisation Type >> Internal ID*} ,

       "short_description":"{$r.f3|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Description*}",
       "logo":"{$r.f182}{*Logo*}",
       "url":"{$r.f77}{*URL*}",

       "extendedDescription":"{$r.f4|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Extended Description*}",

       "contactDetails":"{$r.f17|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Contact Details Or URL(s)*}",
       "location": {
         "mappable":"{$r.f134.f28}{*Location (places) >> Location (mappable)*}",
         "country":"{$r.f134.f26.term}{*Country >> Term*}"
         }
      {/if}

      {* Relationship *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="1")}

        "code": "{$r.f6.code}{*Relationship Type >> Code*}" ,

        {if $r.f6.internalid}
          "typeName": "{$r.f6.term}",
          "typeId": {$r.f6.internalid}{*Relationship Type >> Internal ID*},
        {/if}

        "source":{
          "id":{$r.f7.recID}{*Source Record >> ID*},
          "recTypeId":{$r.f7.recTypeID}{*Source Record >> RecTypeID*},
          "recTypeName":"{$r.f7.recTypeName}{*Source Record >> RecTypeName*}"
        },

        "target": {
          "id":{$r.f5.recID}{*Target Record >> ID*} ,
          "recTypeId":{$r.f5.recTypeID}{*Target Record >> RecTypeID*},
          "recTypeName":"{$r.f5.recTypeName}{*Target Record >> RecTypeName*}"
        },

        "title":"{$r.f1|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Title For Relationship*}",
        "description":"{$r.f3|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Description*}"

      {/if}

      {* document *}
      {* --------------------------------------------------*}

      {if ($r.recTypeID=="13")}

        {if ($r.f210)}
          "startDate":{$r.f210}{*Creation Date*} ,
        {/if}

        "shortSummary":"{$r.f3|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Summary*}",
        "shortTitle": "{$r.f209|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Title*}",
        "longTitle": "{$r.f1|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Long Title*}"

      {/if}

      {* Issue *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="14")}
        "title":"{$r.recTitle}{*RecTitle*}",
        "shortSummary":"{$r.f3}{*Short Summary*}"
      {/if}

      {* Event *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="20")}
        "title":"{$r.recTitle}{*RecTitle*}"
      {/if}
    }
    {if $smarty.foreach.mainloop.last}{else},{/if}
  {/foreach}
]
{/strip}
