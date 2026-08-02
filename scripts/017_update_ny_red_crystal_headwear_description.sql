begin;

update public.products
set description = $$Cappello New Era 59FIFTY New York nero personalizzato artigianalmente con cristalli rossi applicati a mano.

Il logo NY ricamato in bianco è stato completamente impreziosito da una fitta composizione di strass rossi, posizionati uno ad uno per seguire la forma delle lettere e creare un effetto luminoso e tridimensionale. Il contrasto tra il nero del cappello, il ricamo bianco e il rosso brillante rende il design deciso e immediatamente riconoscibile.

A completare il custom sono presenti dettagli ricamati laterali, tra cui una patch grafica e un piccolo simbolo ispirato al mondo del baseball.$$
where id = '835cb227-c4f9-48db-88a2-d8a0ac021c66';

commit;
