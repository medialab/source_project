{strip}
[
  {foreach $results as $r name=mainloop}
    {
      "recordId":{$r.recID},
      "recordTypeId" : {$r.recTypeID},
      "recordTypeName":"{$r.recTypeName}",
      "title":"{$r.recTitle|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}",

      {if ($r.f2)}  "shortName":"{$r.f2|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}",{/if}
      {if ($r.f10)} "startDate":{$r.f10|regex_replace:'/(.*)([0-9][0-9][0-9][0-9])(.*)$/':'$2'},{/if}
      {if ($r.f11)} "endDate":{$r.f11|regex_replace:'/(.*)([0-9][0-9][0-9][0-9])(.*)$/':'$2'},{/if}

      {* Relationship *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="1")}

        {if $r.f6.internalid}
          "typeName": "{$r.f6.term}",
          "typeId": {$r.f6.internalid},
        {/if}

        "source": {$r.f7.recID},
        "target": {$r.f5.recID}{,
      {/if}

      {* Organisation *}
      {* --------------------------------------------------*}
      {if ($r.recTypeID=="4")}
        {if $r.f22.internalid}
          "typeName":"{$r.f22.term|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Organisation Type >> Term*}",
          "typeId":{$r.f22.internalid}{*Organisation Type >> Internal ID*} ,
        {/if}
      {/if}

      {* document *}
      {* --------------------------------------------------*}

      {if ($r.recTypeID=="13")}
        {if {$r.f137.internalid}}
          "typeName": "{$r.f137.term|escape|escape:'htmlall'|replace:'"':'&quot;'|strip}{*Document Type >> Term*}",
          "typeId": {$r.f137.internalid}{*Document Type >> Internal ID*},
        {/if}
      {/if}

      {* any *}
      {* --------------------------------------------------*}
      "end":true
    }
    {if $smarty.foreach.mainloop.last}{else},{/if}
  {/foreach}
]
{/strip}
