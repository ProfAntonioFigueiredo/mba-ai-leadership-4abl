export const VOCABULARY=[['house','casa'],['book','livro'],['water','água'],['sun','sol'],['moon','lua'],['dog','cachorro'],['cat','gato'],['school','escola'],['friend','amigo'],['apple','maçã'],['tree','árvore'],['car','carro']];
export function newMemoryGame(random=Math.random){
 const cards=VOCABULARY.flatMap(([en,pt],pair)=>[{id:`${pair}-en`,pair,language:'en',word:en},{id:`${pair}-pt`,pair,language:'pt-BR',word:pt}]);
 for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 return {cards,selected:[],matched:[],attempts:0,score:0,status:'iniciado',lastAction:'Novo jogo: 24 cartas embaralhadas e placar zerado.',rendered:'Tabuleiro, cartas, placar e indicadores preparados.'};
}
export function memoryReducer(state,action){
 if(action.type==='reset')return action.game;
 if(action.type==='hide'){
  if(state.selected.length!==2)return state;
  return {...state,selected:[],lastAction:'Após 1 segundo, o par incorreto foi virado para baixo.',rendered:'Duas cartas fechadas; tabuleiro liberado para a próxima escolha.'};
 }
 if(action.type!=='select'||state.status==='concluído'||state.selected.length===2||state.selected.includes(action.id))return state;
 const card=state.cards.find(c=>c.id===action.id);
 if(!card||state.matched.includes(card.pair))return state;
 const selected=[...state.selected,card.id];
 if(selected.length===1)return {...state,selected,status:'em andamento',lastAction:'Clique: primeira carta selecionada.',rendered:'Uma carta revelada; estado da partida e painel atualizados.'};
 const first=state.cards.find(c=>c.id===selected[0]);
 const attempts=state.attempts+1;
 if(first.pair!==card.pair)return {...state,selected,attempts,lastAction:'Clique: par incorreto. Aguarde 1 segundo.',rendered:'Segunda carta revelada; tentativas atualizadas; outras cartas bloqueadas.'};
 const matched=[...state.matched,card.pair],completed=matched.length===VOCABULARY.length;
 return {...state,selected:[],matched,attempts,score:matched.length*10,status:completed?'concluído':'em andamento',lastAction:completed?'Último par encontrado: partida concluída!':'Clique: par correto! +10 pontos.',rendered:completed?'Último par, placar, indicadores e mensagem de conclusão atualizados.':'Par mantido visível; acertos, tentativas e pontuação atualizados.'};
}
