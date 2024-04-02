---

layout: post
title: Mathematics for Finance
categories: [Notes]
excerpt: Discussion on Discrete and continuous pricing models for Options, No-arbitrage pricing and the mathematics involved.
toc: 
  sidebar: true
  
---
## Introduction

We will discuss mathematics for options, pricing methods, and optimizing the performance of a portfolio. We will cover discrete (finite probability spaces, tree models) as well as continuous math (Brownian Motion, Black-Scholes formula, Martingale theory).

`Assignment 1 due in 2 weeks` 

The theory in the course revolves around the “No Arbitrage theorem” which is closely related to one-price principle. When you start investment, the idea is to strategize your transactions so that your net income is either positive or neutral. Similarly, the idea of one-price principle theorizes that a set of investments with the same net outcome, albeit with different transactions, should have the same price.

### Odds and Arbitrage

Let us consider the example of a horse race, where $$P(\text {S wins}) = 3/4$$ and $$P(\text{W wins}) = 1/4$$. How do we calculate the odds against $$W$$ winning? It is given by $$P(\text{W wins})/P(\text{W loses}) = 3$$. This situation is called $$3\text{-to-}1$$ odds. That means, a dollar bet $$\textdollar 1$$ brings $$\textdollar 3$$ if $$W$$ wins. Similarly, for $$S$$, it brings $$\textdollar 0.3$$. These bets are an example of a fair game, the net reward $$\frac{1}{4} (3) + \frac{3}{4}(-1)$$ is $$0$$.

A *bookmaker* sets the odds for such scenarios. Consider an other example where the odds are $$9\text{-to-}5$$ against $$W$$ and $$2\text{-to-}5$$ against $$S$$. We claim that this results in an arbitrage for the bookmaker. To illustrate this, consider the bets $$\textdollar 10$$ on $$S$$ and $$\textdollar 5$$ on $$W$$.  The payoff for the bookmaker when $$S$$ wins is $$5 - 10\frac{2}{5} = 1$$.  When $$W$$ wins, the profit is $$10 - 5\frac{9}{5} = 1$$. A bookmaker typically decides the odds after the bets are made so that arbitrage is made in any scenarios. 

Ideally, one wants to make profit from such games. How do we do this? In the first example, we considered the probabilities and calculated the odds. To decide the odds for arbitrage, we do the reverse. In the above scenario, given the odds, the probabilities are $$P(S) \approx 71\%$$ and $$P(W) \approx 36\%$$. The probabilities add up to slightly above $$100\%$$, which makes up the arbitrage for the bookmaker.

### Forwards Contract

An agreement is made between two parties to buy/sell a particular instrument for a *set price* on an agreed time in the future. Such an agreement is called as a forwards contract, and the following illustrates a simple example.

- $$A$$ agrees at time $$t = 0$$ to sell one share at time $$T$$ for $$\textdollar F$$. We assume that $$A$$ buys the share at $$t = 0$$ at price $$S_0$$.
- $$B$$ agrees at time $$t = 0$$ to buy one share at time $$T$$ for $$\textdollar F$$

We assume that $$A, B$$ don’t invest their own money, and borrow money from the bank to perform transactions. Given such a scenario, how do we decide a *fair price* $$F$$? To simplify the calculations, we assume the following -

- No transaction costs or dividends.
- Market is liquid - every transaction has a buyer and seller available.
- Investor is *small* compared to the market. That is, the action of the investor is not momentous enough to change the price of the stock in the market.
- Short selling/borrowing of stock is allowed.

$$B$$ can invest the amount in the bank for a *continuous compound* interest rate $$r$$ during this term. The claim is that $$F = S_0 e^{rT}$$ where $$S_0$$ is the price of the share at $$t = 0$$.  To analyze this, we consider the following cases -

- $$F > S_0 e^{rT}$$
    
    $$A$$ sells the share for $$\textdollar F$$ and repays the loan of $$\textdollar S_0$$ with interest - $$\textdollar S_0 e^{rT}$$. The profit $$A$$ gets is $$F - S_0 e^{rT}$$
    
- $$F > S_0e^{rT}$$
    
    $$B$$ short sells one share for $$\textdollar  S_0$$ and invests $$\textdollar S_0$$ in the bank. The money in the bank will grow to $$S_0 e^{rT}$$ at $$t = T$$, and $$B$$ buys one share at $$F$$. The profit for $$B$$ here is $$S_0 e^{rT} - F > 0$$
    

So the fair price is $$S_0 e^{rT}$$ where neither $$A$$ nor $$B$$ can take advantage.

### European Call Options

Options are similar to forward contracts where the parties agree on a transaction in the future. The important difference is that the option holder *has the right to buy the instrument with no obligation* at $$t = T$$ for $$\textdollar K$$ called the **strike price**. At time $$T$$, if the market price of the instrument is greater than $$K$$, then the option holder exercises his right to gain a profit. Otherwise, he chooses to do nothing. We have the following assuming the option is free -

$$
P = (S_T - K)^+ = \begin{cases} 
  S_T - K & S_T > k \\
  0 & S_T \leq K
\end{cases}
$$

How do we decide the *fair price* at $$t = 0$$ for the option? We need to use probability results to model the price movement to decide this. In discrete time settings, we use different models like Cox, Ross and Rubenstein. In continuous time frame, we use Brownian motion using the Black-Scholes model. In both cases, there exists a unique fair price. However, if the product is slightly more complicated, then there is no unique fair price.
