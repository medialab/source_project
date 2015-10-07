{strip}
[
  {foreach $results as $r name=mainloop}
    {
      "recordId":{$r.recID}{*ID*},
      "recordTypeId" : {$r.recTypeID},
      "recordTypeName":"{$r.recTypeName}{*RecTypeName*}",
      "title":"{$r.recTitle|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*RecTitle*}",

      {if ($r.f2)}  "shortName":"{$r.f2|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Name / Acronym*}",{/if}
      {if ($r.f10)} "startDate":{$r.f10|regex_replace:'/(.*)([0-9][0-9][0-9][0-9])(.*)$/':'$2'}{*Start Date/time*},{/if}
      {if ($r.f11)} "endDate":{$r.f11|regex_replace:'/(.*)([0-9][0-9][0-9][0-9])(.*)$/':'$2'}{*End Date*},{/if}

      {* Organisation *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="4")}
       "name":"{$r.f1|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Name Of Organisation*}",
       "typeName":"{$r.f22.term|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Organisation Type >> Term*}",
       "typeId":{$r.f22.internalid}{*Organisation Type >> Internal ID*} ,
       "description":"{$r.f3|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Description*}"
      {/if}

      {* Relationship *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="1")}

        {if $r.f6.internalid}
          "typeName": "{$r.f6.term}",
          "typeId": {$r.f6.internalid} {*Relationship Type >> Internal ID*},
        {/if}

        "source": {$r.f7.recID}{*Source Record >> ID*},
        "target": {$r.f5.recID}{*Target Record >> ID*}
      {/if}

      {* document *}
      {* --------------------------------------------------*}

      {if ($r.recTypeID=="13")}

        {if ($r.f210)} "startDate":{$r.f210}, {*Creation Date*}{/if}

        "typeName": "{$r.f137.term|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Document Type >> Term*}",
        "typeId": {$r.f137.internalid}{*Document Type >> Internal ID*},
        "shortTitle": "{$r.f209|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Short Title*}"
      {/if}

      {* Issue *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="14")}
        "description":"{$r.f3}{*Short Summary*}"
      {/if}

      {* Event *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="20")}
        "title":"{$r.recTitle}{*RecTitle*}"
      {/if}

      {* Device *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="16")}
        "title":""
      {/if}
    }
    {if $smarty.foreach.mainloop.last}{else},{/if}
  {/foreach}
]
{/strip}
