---
layout: post
title: Mathematics for Finance
categories: [Notes]
excerpt: Discussion on Discrete and continuous pricing models for Options, No-arbitrage pricing and the mathematics involved.
toc: 
  sidebar: true

---

# Introduction

We will discuss mathematics for options, pricing methods, and optimizing the performance of a portfolio. We will cover discrete (finite probability spaces, tree models) as well as continuous math (Brownian Motion, Black-Scholes formula, Martingale theory).

The theory in the course revolves around the “No Arbitrage theorem” which is closely related to one-price principle. Similarly, the idea of one-price principle theorizes that a set of investments with the same net outcome, albeit with different transactions, should have the same price.

## Financial Markets

A *financial market* consists of tradable products such as stocks, bonds, currencies and indices. The market consists of two parties - the buyers and the sellers, who buy and sell these products respectively trying to make an *arbitrage* from the transactions. Formally, an *arbitrage opportunity* is a chance for a risk-free profit. 

### Odds and Arbitrage

Let us consider the example of a horse race, where $$P(\text {S wins}) = 3/4$$ and $$P(\text{W wins}) = 1/4$$. How do we calculate the odds against $$W$$ winning? It is given by $$P(\text{W wins})/P(\text{W loses}) = 3$$. This situation is called $$3\text{-to-}1$$ odds. That means, a dollar bet $$\$ 1$$ brings $$\$ 3$$ if $$W$$ wins. Similarly, for $$S$$, it brings $$\$ 0.3$$. These bets are an example of a fair game, the net reward $$\frac{1}{4} (3) + \frac{3}{4}(-1)$$ is $$0$$.

A *bookmaker* sets the odds for such scenarios. Consider an other example where the odds are $$9\text{-to-}5$$ against $$W$$ and $$2\text{-to-}5$$ against $$S$$. We claim that this results in an arbitrage for the bookmaker. To illustrate this, consider the bets $$\$ 10$$ on $$S$$ and $$\$ 5$$ on $$W$$.  The payoff for the bookmaker when $$S$$ wins is $$5 - 10\frac{2}{5} = 1$$.  When $$W$$ wins, the profit is $$10 - 5\frac{9}{5} = 1$$. A bookmaker typically decides the odds after the bets are made so that arbitrage is made in any scenarios. 

Ideally, one wants to make profit from such games. How do we do this? In the first example, we considered the probabilities and calculated the odds. To decide the odds for arbitrage, we do the reverse. In the above scenario, given the odds, the probabilities are $$P(S) \approx 71\%$$ and $$P(W) \approx 36\%$$. The probabilities add up to slightly above $$100\%$$, which makes up the arbitrage for the bookmaker.

### Contingent Claim

A **derivative** or a **contingent claim** is a security whose value depends on the value of an underlying asset. Forward contracts, futures contracts and options are examples of such securities. Interestingly, the markets around the world also use derivatives whose underlying asset is also a derivative. Such securities are called as *structured products*. 

With such contrived products, it is important to choose a *fair price* to ensure there are no arbitrage opportunities in the market. To do so, we introduce the required mathematical notation - 
$$X$$ is a real-valued random variable defined on a probability space $$(\Omega, \mathcal F, P)$$ and $$\mathcal G$$ is a sub-$$\sigma$$-algebra of $$\mathcal F$$. For unfamiliar readers, in probability theory, a probability space consists of three elements -

- A sample space $$\Omega$$, which is the set of all possible outcomes. For example, the sample space for a dice roll is $$\Omega = \{1, 2, 3, 4, 5, 6\}$$. 
- An event space or a set of events is represented by $$\mathcal F$$. For example, the events constituting an odd dice roll is $$\mathcal F = \{1, 3, 5\}$$.
- A probability function $$P$$, assigns a probability (a number between $$0$$ and $$1$$) to each event in the event space. 

The term $$\sigma$$-algebra on a set $$X$$ refers to a nonempty collection $$\Sigma$$ of subsets of $$X$$ closed under complement, countable unions, and countable intersections. The pair $$(X, \Sigma)$$ is called a **measurable space**.

In general, we model the price of a contract with a random variable $$X$$ that evolves across time with $$X(w) \geq 0$$ (all the values for the random variable are positive). For example, for the *call option* described in #options, we have

$$ X(w) = (S(w)_t - K)^+ $$

Similarly, for a *put* option, where the holder has the right to sell a certain asset at a fixed price, we get

$$X(w) = K - S_T)^+$$.

There can be other kinds of *structured products* like

- $$ X = \max(S_1, \dots, S_T) $$
- $$ X = \left(\frac{1}{T} \sum_{t = 1}^T S_t - K\right)^+ $$

In the above definitions, the variables $$w, S_t$$ capture the evolution of price across time, and are described in the later section. The key takeaway is that, we are trying to price a contingent claim $$X$$ - find $$C_0(X)$$

### Forwards Contract

A **forward constract** is an agreement to buy or sell an asset at a *certain* future time for a *certain* price. Consider the following example,

- $$A$$ agrees at time $$t = 0$$ to sell one share at time $$T$$ for $$\$ F$$. We assume that $$A$$ buys the share at $$t = 0$$ at price $$S_0$$.
- $$B$$ agrees at time $$t = 0$$ to buy one share at time $$T$$ for $$\$ F$$

We assume that $$A, B$$ don’t invest their own money, and borrow money from the bank to perform transactions. Given such a scenario, how do we decide a *fair price* $$F$$? To simplify the calculations, we assume the following -

- No transaction costs or dividends.
- Market is liquid - every transaction has a buyer and seller available.
- Investor is *small* compared to the market. That is, the action of the investor is not momentous enough to change the price of the stock in the market.
- Short selling/borrowing of stock is allowed.

$$B$$ can invest the amount in the bank for a *continuous compound* interest rate $$r$$ during this term. The claim is that $$F = S_0 e^{rT}$$ where $$S_0$$ is the price of the share at $$t = 0$$.  To analyze this, we consider the following cases -

- $$F > S_0 e^{rT}$$
  
    $$A$$ sells the share for $$\$ F$$ and repays the loan of $$\$ S_0$$ with interest - $$\$ S_0 e^{rT}$$. The profit $$A$$ gets is $$F - S_0 e^{rT}$$

- $$F > S_0e^{rT}$$
  
    $$B$$ short sells one share for $$\$  S_0$$ and invests $$\$ S_0$$ in the bank. The money in the bank will grow to $$S_0 e^{rT}$$ at $$t = T$$, and $$B$$ buys one share at $$F$$. The profit for $$B$$ here is $$S_0 e^{rT} - F > 0$$

So the fair price is $$S_0 e^{rT}$$ where neither $$A$$ nor $$B$$ can take advantage.

*Note.* A **futures contract** is similar to a forward contract but is traded on a financial exchange. They typically have a delivery month rather than a delivery date, and are followed by a settlement procedure called *marking to market*. 

### Options

An **option** is a contract which gives the holder of the option the right, but not the obligation, to buy other sell a given security at a given price (called the *strike* price) within a fixed time period $$[0, T]$$. A **call option** gives the option holder the right to buy at the given price, whereas the *put option* gives the option holder the right to sell at the given price. 

## European Call Options

A *European option* can only be exercised by the holder of the option at the expiration time $$T$$ (unlike an American Option, which will be discussed in the later sections). We have the following equation for profit of a *call option* holder, assuming the option is free -

$$
P = (S_T - K)^+ = \begin{cases} 
  S_T - K & S_T > k \\
  0 & S_T \leq K
\end{cases}
$$

How do we decide the *fair price* at $$t = 0$$ for the option? We need to use probability results to model the price movement to decide this. In discrete time settings, we use different models like Cox, Ross and Rubenstein. In continuous time frame, we use Brownian motion using the Black-Scholes model. In both cases, there exists a unique fair price. However, if the product is slightly more complicated, then there is no unique fair price.

{% include_relative 02.md %}
{% include_relative 03.md %}
{% include_relative 04.md %}

{% include_relative 05.md %}

{% include_relative 06.md %}

{% include_relative 07.md %}

{% include_relative 08.md %}
