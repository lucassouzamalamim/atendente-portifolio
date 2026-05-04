insert into public.system_info (topic, content)
select 'Sobre Mim', 'Meu nome e Lucas, sou engenheiro de software especializado em construir aplicacoes web escalaveis.'
where not exists (select 1 from public.system_info where topic = 'Sobre Mim');

insert into public.system_info (topic, content)
select 'Habilidades', 'Java, Spring Boot, React, TypeScript, PostgreSQL, Docker e AWS.'
where not exists (select 1 from public.system_info where topic = 'Habilidades');

insert into public.system_info (topic, content)
select 'Contato', 'WhatsApp: https://wa.me/5542999839219'
where not exists (select 1 from public.system_info where topic = 'Contato');

insert into public.project (title, description, technology, url, image_url)
select 'Chatbot IA', 'Assistente virtual inteligente para atendimento automatico e qualificacao de leads.', 'Supabase, React, OpenAI API', 'https://github.com/lucasdev/chatbot-ai', 'https://via.placeholder.com/300/4caf50/fff.png'
where not exists (select 1 from public.project where title = 'Chatbot IA');
