from app.schemas.auth import Login, Token, AlterarPassword
from app.schemas.admin import LoginAdmin, LerAdmin, AtualizarAdmin
from app.schemas.licenca import LerLicenca
from app.schemas.gestor import CriarGestor, AtualizarGestor, LerGestor
from app.schemas.contrato import CriarContrato, AtualizarContrato, LerContrato
from app.schemas.edificio import CriarEdificio, AtualizarEdificio, LerEdificio
from app.schemas.apartamento import CriarApartamento, AtualizarApartamento, LerApartamento
from app.schemas.condomino import CriarCondomino, AtualizarCondomino, LerCondomino
from app.schemas.tecnico import CriarTecnico, AtualizarTecnico, LerTecnico
from app.schemas.parceiro import CriarParceiro, AtualizarParceiro, LerParceiro
from app.schemas.espaco import CriarEspaco, AtualizarEspaco, LerEspaco
from app.schemas.material_espaco import CriarMaterialEspaco, AtualizarMaterialEspaco, LerMaterialEspaco
from app.schemas.aluguer_espaco import CriarAluguerEspaco, LerAluguerEspaco
from app.schemas.aluguer_material import CriarAluguerMaterial, LerAluguerMaterial
from app.schemas.pagamento import CriarPagamento, LerPagamento
from app.schemas.registo_avaria import CriarRegistoAvaria, AtualizarRegistoAvaria, LerRegistoAvaria
from app.schemas.resolucao_avaria import CriarResolucaoAvaria, AtualizarResolucaoAvaria, LerResolucaoAvaria
