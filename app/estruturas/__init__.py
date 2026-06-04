from app.estruturas.autenticacao import Login, Token, AlterarPassword
from app.estruturas.admin import LerAdmin, AtualizarAdmin
from app.estruturas.licenca import LerLicenca
from app.estruturas.gestor import CriarGestor, AtualizarGestor, LerGestor
from app.estruturas.contrato import CriarContrato, AtualizarContrato, LerContrato
from app.estruturas.edificio import CriarEdificio, AtualizarEdificio, LerEdificio
from app.estruturas.apartamento import CriarApartamento, AtualizarApartamento, LerApartamento
from app.estruturas.condomino import CriarCondomino, AtualizarCondomino, LerCondomino
from app.estruturas.tecnico import CriarTecnico, AtualizarTecnico, LerTecnico
from app.estruturas.parceiro import CriarParceiro, AtualizarParceiro, LerParceiro
from app.estruturas.espaco import CriarEspaco, AtualizarEspaco, LerEspaco
from app.estruturas.material_espaco import CriarMaterialEspaco, AtualizarMaterialEspaco, LerMaterialEspaco
from app.estruturas.aluguer_espaco import CriarAluguerEspaco, LerAluguerEspaco
from app.estruturas.aluguer_material import CriarAluguerMaterial, LerAluguerMaterial
from app.estruturas.pagamento import CriarPagamento, LerPagamento
from app.estruturas.registo_avaria import CriarRegistoAvaria, AtualizarRegistoAvaria, LerRegistoAvaria
from app.estruturas.resolucao_avaria import CriarResolucaoAvaria, AtualizarResolucaoAvaria, LerResolucaoAvaria



#As estruturas são classes Pydantic que definem 
# exatamente quais campos cada endpoint aceita ou devolve, fazem validação 
# automática desses campos (por exemplo email válido e password com mínimo de 8 caracteres)