# Sistema de Gestão de Condomínios

Aplicação web para gestão de condomínios, desenvolvida no âmbito da unidade curricular de MODSI no ISEP.

## Funcionalidades

- Autenticação com email/password e Google OAuth
- Gestão de edifícios, apartamentos e condóminos
- Gestão de técnicos e avarias
- Gestão de pagamentos e quotas
- Reserva de espaços e aluguer de materiais
- Relatórios financeiros (Excel e PDF)
- Suporte e contacto
- Painel de administração
- Licenças e pagamento via Stripe

## Tecnologias

**Backend**
- Python 3.13 + FastAPI + Uvicorn
- SQLAlchemy (ORM) + MariaDB
- JWT (autenticação) + Google OAuth (authlib)
- openpyxl + reportlab (relatórios)
- aiosmtplib (envio de emails)

**Frontend**
- HTML + CSS + JavaScript 


## Deploy (ISEP AVE)

A aplicação está disponível em:
[http://ave.dee.isep.ipp.pt/~1211405/modsi/Sistema_Gestao_Condominios/frontend/web_app_visitante/index.html]


## Soft Delete

Todos os registos usam soft delete — nunca são eliminados fisicamente da base de dados.
`status = 1` → ativo | `status = 0` → inativo

## Autores

Desenvolvido por estudantes do ISEP — MODSI 2025/2026.
