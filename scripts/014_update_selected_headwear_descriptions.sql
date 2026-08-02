begin;

update public.products
set description = $$Cappello New Era 59FIFTY rosso personalizzato a mano con applicazioni di borchie sferiche dorate. Il logo NY ricamato in bianco è stato impreziosito da un contorno completo di micro-borchie gold, che ne esalta la forma e crea un forte effetto gioiello.$$
where id = '4c89683d-939d-427a-8a34-3e00f9509d1e';

update public.products
set description = $$Cappello New Era 59FIFTY Los Angeles in tonalità bianco ghiaccio, personalizzato artigianalmente con applicazioni dorate. Il logo LA ricamato è stato interamente contornato da micro-borchie gold, applicate una ad una per creare un raffinato effetto gioiello. La visiera presenta una lavorazione distressed sui bordi ed è impreziosita da borchie dorate di diverse dimensioni, distribuite in modo irregolare per un risultato ancora più esclusivo.$$
where id = 'dc89f425-f02a-44e6-9694-b8131baed774';

commit;
