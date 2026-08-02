begin;

update public.products
set description = $$Cappello New Era 59FIFTY Los Angeles in azzurro pastello, personalizzato artigianalmente con una lavorazione distressed e applicazioni metalliche color argento.

Il logo LA ricamato in bianco è interamente rifinito con micro-borchie sferiche argentate, applicate una ad una lungo il profilo delle lettere per creare un effetto tridimensionale, luminoso e prezioso.

La visiera è decorata con borchie bombate di diverse dimensioni, distribuite in modo irregolare per dare movimento e carattere al design. Ulteriori dettagli metallici sono applicati lungo le cuciture e sulla corona.

La lavorazione distressed si concentra soprattutto sul bordo della visiera e sulle cuciture, volutamente consumate e leggermente sfilacciate, per donare al cappello un aspetto vissuto e autenticamente streetwear.$$
where id = 'b7629ec4-34d2-428b-b0d8-ccfd9317de99';

commit;
