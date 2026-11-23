---
title: Perguntas frequentes
description: "Respostas curtas às perguntas comuns."
---

## É oficial?

Não. `@ix-xs/metamob.api` é um projeto independente de código aberto, sob a licença MIT, sem ligação com o Metamob nem com a Ankama. Ele segue a [API pública do Metamob](https://www.metamob.fr/help/api), e é atualizado quando a API muda.

## O que é o Metamob?

O [Metamob](https://www.metamob.fr) é um site gratuito onde os jogadores de Dofus acompanham os monstros das missões do Dofus Ocre e do Dokille, e se encontram para trocá-los. Ele cobre Dofus (Unity), Dofus Retro e Dofus Touch.

## Ela cobre toda a API?

Sim, os 43 endpoints. [Todos os métodos](/resources/methods/) os lista, com o método que chama cada um.

## Preciso de uma chave de API?

Para toda chamada à API, sim: veja [Sua chave de API](/start/api-key/). Os [dados do pacote](/basics/embedded-data/) não precisam de nenhuma.

## É gratuita?

A biblioteca é, e a API também. A API aceita 60 requisições por minuto por chave, e o cliente fica abaixo disso: veja [O limite de requisições](/basics/rate-limit/).

## Posso aumentar o limite de requisições?

Não, e não tente contorná-lo com várias chaves: o limite mantém o site disponível para todos. Para fazer menos requisições, veja [O limite de requisições](/basics/rate-limit/#spending-fewer-requests).

## Funciona com TypeScript? Com JavaScript puro?

Com os dois. Ela é escrita em TypeScript e inclui seus tipos. Em JavaScript, seu editor continua mostrando a documentação e completando os nomes dos monstros.

## ES modules ou CommonJS?

Os dois: `import { Metamob }` e `const { Metamob } = require(...)`. Veja [Ambientes de execução](/help/runtimes/).

## Posso usá-la em um navegador?

Sim, com cuidado com a chave: veja [Ambientes de execução](/help/runtimes/#browsers). O objeto `data` sozinho é seguro em qualquer lugar.

## Em que idioma estão os nomes?

Francês, inglês, espanhol, português e alemão. Todo monstro, zona e subzona tem um `name` com `fr`, `en`, `es`, `pt` e `de`, e os cinco são aceitos onde quer que um nome seja: veja [Nomes e ids](/basics/names-and-ids/).

## Quão atualizados estão os dados do pacote?

`data.fetchedAt` dá a data em que foram lidos da API, e cada versão do pacote os atualiza. Um monstro mais novo que a sua versão continua funcionando pelo nome nas chamadas: a biblioteca então procura o nome na API. Veja [Os dados do pacote](/basics/embedded-data/#when-the-game-changes).

## Ela pode criar uma missão, enviar uma mensagem ou propor uma troca?

Ela pode enviar uma mensagem e propor uma troca, depois que o Metamob liberar o envio na sua conta: veja [Conversas](/resources/conversations/#sending-a-message) e [Propostas de troca](/resources/trade-proposals/#making-a-proposal). Ela também escreve nas suas missões: configurações, quantidades e configurações manuais de troca. Também pode aplicar uma proposta, desfazer o seu lado em até 2 horas, ou cancelá-la. Criar uma missão se faz no site.

## Posso gerenciar as missões de outros jogadores?

Com a chave deles, dada de livre vontade: veja [Agir por outros jogadores](/basics/many-keys/). Sem ela, você pode ler o que eles tornaram público.

## Como somo um a uma quantidade?

Leia-a, depois defina-a: `setMonster` define uma quantidade. O trecho está em [Solução de problemas](/help/troubleshooting/#setmonster-did-not-add-one).

## Ela tenta de novo sozinha?

Sim: limites de requisições, erros de servidor em leituras, tempos esgotados e falhas de rede, até 3 vezes com intervalos crescentes. Exceto o envio de uma mensagem ou de uma proposta, que nunca é tentado de novo. Veja [Erros](/basics/errors/#what-is-retried).

## Eu usava a versão 4. O que muda?

A forma de chamar os métodos, não o que eles fazem. [Vindo da versão 4](/help/migrating-from-v4/) dá o substituto de cada método.

## Onde relato um bug ou peço algo?

No [GitHub](https://github.com/ix-xs/metamob.api/issues). Para um problema com a própria API ou com o site, o Metamob tem seu próprio contato em [metamob.fr](https://www.metamob.fr).
