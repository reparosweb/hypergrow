-- Confere se as tabelas novas existem e quantas linhas cada uma tem.
-- Cole no SQL Editor e rode. Me manda o resultado (a tabelinha que aparece).

select
  t.table_name,
  (select count(*) from information_schema.columns c
     where c.table_schema = 'public' and c.table_name = t.table_name) as colunas
from information_schema.tables t
where t.table_schema = 'public'
  and t.table_name in (
    'lead_notes', 'financial_categories', 'receivables', 'payables',
    'finance_logs', 'appointments', 'google_calendar_auth',
    'automation_rules', 'message_log'
  )
order by t.table_name;
