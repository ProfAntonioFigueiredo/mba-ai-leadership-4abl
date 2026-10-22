import React,{useEffect,useReducer} from 'react';
import {newMemoryGame,memoryReducer} from './memory-game.mjs';
export function MemoryGame(){
 const [game,dispatch]=useReducer(memoryReducer,undefined,()=>newMemoryGame());
 const locked=game.selected.length===2;
 useEffect(()=>{if(!locked)return;const timer=setTimeout(()=>dispatch({type:'hide'}),1000);return()=>clearTimeout(timer);},[locked,game.selected]);
 const selected=game.selected.map(id=>game.cards.find(c=>c.id===id));
 return <section className="panel memory-game"><div className="section-head"><div><h2>Memory Game</h2><p>Encontre os 12 pares: uma palavra em inglês e sua tradução em português.</p></div><button className="primary" onClick={()=>dispatch({type:'reset',game:newMemoryGame()})}>Novo Jogo</button></div>
 <p className="memory-rule">Cada par vale <strong>10 pontos</strong>. Uma tentativa é contada ao revelar a segunda carta. Sem desconto por erro.</p>
 <dl className="memory-stats"><div><dt>Tentativas</dt><dd>{game.attempts}</dd></div><div><dt>Acertos</dt><dd>{game.matched.length} / 12</dd></div><div><dt>Situação</dt><dd>{game.status}</dd></div></dl>
 <p className="memory-feedback" role="status" aria-live="polite">{game.status==='concluído'?`Parabéns! Você encontrou todos os pares em ${game.attempts} tentativas e marcou ${game.score} pontos.`:game.lastAction}</p>
 <div className="memory-board" role="group" aria-label="Tabuleiro de memória: 5 colunas e 5 linhas" aria-busy={locked}>
 {game.cards.map((card,index)=>{const matched=game.matched.includes(card.pair),open=matched||game.selected.includes(card.id);return <button type="button" key={card.id} className={'memory-card'+(open?' is-open':'')+(matched?' is-matched':'')} disabled={locked||open||game.status==='concluído'} onClick={()=>dispatch({type:'select',id:card.id})} aria-label={open?`Posição ${index+1}: ${card.word}${matched?', par encontrado':''}`:`Revelar carta ${index+1}`}><span className="memory-card-content">{open?<><small>{card.language==='en'?'EN':'PT'}{matched?' ✓':''}</small><strong lang={card.language}>{card.word}</strong></>:<><span aria-hidden="true">✦</span><small>{index+1}</small></>}</span></button>;})}
 <div className="memory-score" aria-label={'Pontuação: '+game.score}><span aria-hidden="true">★</span><small>Pontuação</small><strong>{game.score}</strong><small>de 120 pontos</small></div>
 </div>
 <section className="memory-learning" aria-labelledby="memory-learning-title"><h3 id="memory-learning-title">Como o FrontEnd funciona</h3><p>Acompanhe como suas escolhas mudam a interface.</p><dl><div><dt>Estado</dt><dd>Cartas selecionadas: {selected.length?selected.map(c=>c.word).join(' + '):'nenhuma'}. Pares encontrados: {game.matched.length}. Pontuação: {game.score}. Tentativas: {game.attempts}. Situação: {game.status}.</dd></div><div><dt>Renderização</dt><dd>{game.rendered}</dd></div><div><dt>Reatividade</dt><dd>{game.lastAction}</dd></div></dl></section>
 </section>;
}
