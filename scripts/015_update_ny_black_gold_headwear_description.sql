begin;

update public.products
set description = $$Cappello New Era 59FIFTY New York nero personalizzato artigianalmente con una lavorazione distressed e applicazioni metalliche dorate.

Il logo NY ricamato in bianco è evidenziato da una fitta cornice di micro-borchie sferiche color oro, applicate singolarmente lungo tutto il profilo delle lettere. La combinazione di borchie piccole e più grandi crea volume, luminosità e un marcato effetto gioiello. Ulteriori borchie bombate, disposte in piccoli gruppi sulla corona e sulla visiera, completano la personalizzazione con un risultato irregolare e ricercato.

La lavorazione distressed è visibile nelle cuciture e nei bordi volutamente consumati e leggermente sfilacciati, che conferiscono al cappello un aspetto vissuto, ruvido e autenticamente streetwear.$$
where id = 'd7304772-f3df-4ad3-84b0-b2039f9812a1';

commit;
