---
author:
- |
  Sudhansh Peddabomma\
  under the supervision of Qipeng Liu\
  University of California San Diego
bibliography:
- ref.bib
date: December 2023
title: |
  Quantum Money Schemes and Attacks\
  Course Project\
---

# Introduction

The current system for money is versatile and convenient but issues such
as data leaks, counterfeits and frauds are still commonplace in many
regions of the world. In the current system, we have two kinds of money

-   Physical money - This form of money includes coins, notes, precious
    metals, etc. These media of money can easily be verified for
    validity, but they can be counterfeited.

-   Virtual Money - The kind of money accessible through bank accounts
    and credit lines. These systems rely on a third-party (the bank) for
    transactions. The transactions are sometimes not private - when the
    statements are leaked.

We ideally want a form of money that cannot be counterfeited and can be
spent without leaving a trace. Such a system is not possible with
digital money because any information passed through classical
communication channels can be copied, making it infeasible for any such
kind of system.

Quantum systems, unlike their classical counterparts possess unique
properties, and present a promising avenue to develop monetary schemes.
Due to the laws of physics, it is impossible to clone a given quantum
state as results of the **No-cloning theorem**. Wiesner [@Wiesner]
proposed quantum money as one of the first applications of this
property. Despite numerous attempts to refine quantum money schemes,
Wiesner's original proposal remains widely adopted due to its efficiency
and simplicity.

Most of the schemes, including that of Wiesner's, are based on a
*secret-key* architecture, wherein only the issuing authority or the
bank can verify a given quantum note. As a result, every transaction has
to be verified by the bank making the system inefficient. Furthermore,
many of these schemes are proven not be secure. Such attacks, as
discussed in later sections, leverage quantum properties to prepare
counterfeit notes.

Ideally, we require a *public-key* system, where any user can use a
public-key to verify a given quantum note. However, these schemes are
difficult to formulate, and there is a very small number of such
schemes.

*Quantum Lightning*, proposed by Mark Zhandry et al.
[@quantum_lightning], is a famous approach for public-key quantum money.
While initially regarded as a promising public-key quantum money
approach, recent research [@quantum_lightning_security] has identified
vulnerabilities challenging its fundamental assumptions.

In this report, we delve into the landscape of quantum money, exploring
its potential and addressing the challenges faced by existing schemes.
We analyze the security implications and advancements in the field, with
a focus on both secret-key and public-key architectures.

# Background

## Quantum computing

Before we delve into the protocols, let us summarise some fundamentals
from quantum mechanics. Quantum mechanical systems store information in
a very different way as compared to classical or non-quantum systems -
the act of measuring a quantum state changes the state itself.

::: definition
**Definition 1** (Qubit). *A qubit is mathematically described as
$$\begin{aligned}
    \ket{\phi} = \alpha \ket{0} + \beta \ket{1} 
\end{aligned}$$*
:::

where $\alpha, \beta \in \mathbb{C}$ such that
$\vert \alpha \vert^2 + \vert \beta \vert^2 = 1$, and the states
$\ket{0}, \ket{1}$ form a basis for the 2D vector space.

In such a state, the probability of obtaining $0$ upon measuring the
qubit is given by $\vert \alpha \vert^2$. Simply put, the coefficients
associated with the basis states represents the probability of obtaining
that particular basis state in the output.

::: definition
**Definition 2** ($n$-qubit system). *In general, an $n$-qubit quantum
state is of the form $$\begin{aligned}
        \ket{\phi} = \sum_{x \in \{0, 1\}^n} \alpha_x \ket{x}
    
\end{aligned}$$ where $\alpha_x \in  \mathbb C$ and
$\sum_{x \in \{0, 1\}^n} \|\alpha_x\|^2  = 1$.*
:::

Similarly, we can generalise the notion of measurement to a general
state basis using **Born's rule**.

::: definition
**Definition 3** (Born's Rule). *A quantum state $\ket{\phi}$ measured
under the basis $\ket{\phi_i}$ yields the classical output $i$, with
probability $\|\langle \phi_i \vert \phi \rangle\|^2$ and the quantum
state collapses to $\ket{\phi_i}$*
:::

Qubits, unlike classical bits, cannot be copied. There are
well-established theoretical results for approximate cloning of qubits -
these allow us to design cryptographic protocols beyond classical
computers. One famous example for such a result is quantum-key
distribution.

Technically, we can clone qubits under certain conditions - we can
always generate basis states like $\ket{0}, \ket{1}$. Therefore, we
cannot use the no-cloning theorem directly for quantum money. We need a
design scheme that is cryptographically secure, and such schemes are
discussed below.

## Mixed States

The state of the form
$\ket{\phi} = \sum_{x \in \{0, 1\}^n} \alpha_x \ket{x}$ is called a pure
state.

::: definition
**Definition 4** (Mixed States). *Consider an $n$-qubit quantum state of
the form $$\begin{aligned}
        \rho = \begin{cases}
            \ket{\phi_1} & \text{ with probability } p_1 \\
            \ket{\phi_2} & \text{ with probability } p_2  \\
            \vdots & \\
            \ket{\phi_m} & \text{ with probability } p_m 
        \end{cases}
    
\end{aligned}$$ where for $i \in [m]$, $\ket{\phi_i}$ is an $n$-qubit
pure/mixed state, $p_i \geq 0$ and $p_1 + p_2 + \cdots + p_m = 1$*

*The mathematical notation for the density matrix $\rho$ is given by
$$\begin{aligned}
        \rho = \sum_{i \in [m]} p_i \ketbra{\phi_i}{\phi_i}
    
\end{aligned}$$*
:::

The notion of measurement for mixed states is generalised by the
following

::: definition
**Definition 5** (Projective Measurements). *When $\rho$ is measured
under a projective measurement ${P_i}_i$ with $\sum_i P_i = \mathbb I$
and $P^2_i = P_i$, we see the outcome $i$ with probability
$p_i = \texttt{Tr}[P_i\rho]$ and the state collapses to
$\frac{P_i \rho P_i}{\texttt{Tr}[P_i \rho P_i]}$*
:::

## Elitzur-Vaidman bomb Testing

The goal of the Elitzur-Vaidman Bomb Testing is to test whether a
"quantum bomb\" system is a dud or an actual bomb. We can interact with
the system using an input state $\ket{\phi}$. The output state remains
$\ket{0}$ if there is no bomb. On the other hand, in presence of a bomb,
if the output state flips to $\ket{1}$ (based on Born's rule) it
explodes.

There is a safe algorithm to test whether the system is a dud or a bomb,
without triggering it, based on the Zeno effect [@lemeshko2009quantum].
It is a prime example of measuring a property of a system without
disturbing it. The algorithm is a probabilistic test that can certify a
property of an object, by measuring another system that has not
interacted with the object.

The testing procedure chooses a large $N$ and a small angle
$\delta = \frac{\pi}{2N}$. It uses two registers (probe and the system).
Start with a the system state $\ket{\phi} = \ket{0}$ -

1.  Prepare an augmented state with *ancillary probe qubit*, starting
    with $\ket{0}$.

2.  Rotate the probe by a small angle $\delta$.

3.  Apply $\texttt{CNOT}$ to couple the probe and the system qubit

4.  Send the system qubit into the system, and obtain the collapsed
    state after measurement (if no explosion)

After $N$ iterations, the probe qubit will output $1$ with certainty
when there is a bomb. It can be shown that the probability of explosion
with the algorithm is of the order $O(1/N)$.

![Visualization of the EVD Bomb
Testing](Images/evb_vis.png){#fig:evb_vis width="\\textwidth"}

## Protective Measurements {#sec:pm}

The concept of protective measurement was proposed by Aharnov et al. in
[@PM] to measure a wave-function without changing its properties
appreciably when the measurement is being made.

It involves measuring the expectation value of a dichotomic observable
$A$, to gauge the properties of the system

::: definition
**Definition 6** (Dichotomic Observable). *A dichotomic observable $A$
is an operator with eigenvalues $\plusminus 1$ defined by
$$\begin{aligned}
        A = P - P^\perp
    
\end{aligned}$$ where $P$ is a projector on its $+1$ eigenspace*
:::

Given an unknown state $\ket{\alpha} \in \mathbb C^d$, and an access to
a two outcome von Neumann measurement
$\{\Pi = \ket{\alpha}\bra{\alpha}, \mathbb I - \Pi\}$, the protocol for
protective measurement has running time $N$, accuracy $\epsilon$, and a
failure probability $f$, when

-   The protocol uses at most $N$ calls to the projective measurement

-   The probability that all outcomes are $\Pi$ is at least $1 - f$

That is, we prepare a probe state $\ket{\phi}\ket{\alpha}$ and map it to
$\left[e^{-i c \langle A \rangle \sigma_x} \ket{\phi} + \mathcal O(\epsilon) \ket{\phi'}\right]\ket{\alpha}$
for an appropriate constant $c$ for an error state $\ket{\phi'}$ after
$N$ steps.

The idea is to then use the classical information $\langle A \rangle$ to
measure $\alpha$. For example, we can measure the expected value of the
Pauli matrices on $\alpha$ using this procedure, and accurately
reconstruct the required state.

# Quantum Money

A quantum money scheme is characterized by two functions

-   A token generation procedure $\texttt{TokenGen}(1^\lambda)$ that
    generates a serial number $S$ and a quantum money state $\ket{\$}$.
    The serial number is kept *secret* with the bank, and the quantum
    banknotes are shared with the customers.

-   The verification procedure $\texttt{Ver}(S, \ket{\$})$ outputs $0$
    if the banknote is valid and $1$ if invalid. The bank can either
    choose to return the resulting state after verification (if the
    verification does not invalidate the note) or issue a new note to
    the user. The procedure should be successful with a *very high
    probability* for a correct input state.

We consider two categories of quantum money

-   Private key quantum money

-   Public key quantum money

## Private-key quantum money

In such schemes, only the issuing authority can verify a quantum money
state. They maintain a database of secret keys for each quantum bill
issued, and verify the input quantum state with that key. Stephen
Wiesner proposed one of the first frameworks in this category in 1969
[@Wiesner] (but published in 1983). In these frameworks, each quantum
bill is a unique random quantum state, which the issuing authority
labels with a serial number.

Formally, a quantum bank note is defined as $n$-qubit quantum state,
where each of the qubit is randomly drawn from the set
$\{ \ket{0}, \ket{1}, \ket{+}, \ket{-}\}$. Each such state is associated
with a serial number which the issuing authority keeps note of. During a
transaction, the quantum bill is sent to the mint where the bill is
matched against the corresponding serial number and verified. It can be
shown that the probability of cloning these bills can be bounded by
$0.85^n$. However, the main bottleneck in this protocol is that every
transaction must be conveyed to the bank/issuing authority.

In a follow-up paper by Bennet et al. [@Bennett1982QuantumCO], a fixed
*psuedo-random* function was proposed to choose the secret keys for all
the serial numbers, avoiding the growth of the secret-key table with the
number of notes issued. The next scheme in this category was suggested
by Tokunaga et al. in 2003. However, in this scheme, the bank has to
destroy all the issued bills once it detects a counterfeit note which
limits its practical applicability.

## Public-key quantum money

These schemes are the desired ideal money form, where any user can
verify the authenticity of a quantum money state. Bennett et al.
proposed such a scheme in 1982 [@Bennett1982QuantumCO] wherein a quantum
money is essentially a token which can only be used once. However, this
scheme can be easily broken by a quantum computer that can run *Shor's
algorithm* [@Shor1995PolynomialTimeAF].

Mosca and Stebila [@mosca2009quantum] proposed using the same quantum
states for the same denomination. They used the *complexity-theoretic
no-cloning theorem* proved by Aaronson [@Aaronson_2009] (which basically
limits the cloning ability through computational power), but they did
not give a concrete implementation for such a scheme.

The difficulty of developing public-key quantum money lies in the
designing the verification algorithm. Typically, in schemes like Weisner
coding, the counterfeiter can repeatedly query the bank's verification
scheme to duplicate a note with high probability of not getting caught
(discussed later). However, this can be prevented if the bank returns a
new note after verification and a *strict testing* regime, where no bank
note is returned on failed verification.

## Wiesner's Quantum Money Scheme

Consider $X \in \{0, 1\}$ and $\theta \in \{0, 1\}$. Then, a *single
qubit Weisner state* is defined as $$\begin{aligned}
    \ket{X^\theta} &= \begin{cases}
        \ket{0} \text{ or } \ket{1}, & \theta = 0 \\
        \ket{+} \text{ or } \ket{-}, & \theta = 1 
    \end{cases} \\
    &= H^\theta \ket{X}
\end{aligned}$$

where $\ket{+} = \frac{1}{\sqrt{2}}{\ket{0} + \ket{1}}$ and
$\ket{-} = \frac{1}{\sqrt{2}}{\ket{0} - \ket{1}}$. This can easily be
extended to $n$-qubit systems as
$\ket{X^{\theta}} = \ket{X_1^{\theta_1}}\ket{X_2^{\theta_2}} \dots$.

Using the above framework, Wiesner Quantum Money scheme is then defined
as the following

::: definition
**Definition 7** (Wiesner's Quantum Money Scheme). *The scheme is
characterized by two functions $\texttt{TokenGen}(1^\lambda)$ and
$\texttt{Ver}(S, \ket{\$})$*

-   *The token generation procedure $\texttt{TokenGen}(1^n)$ generates a
    serial number $S$ and and a quantum money state $\ket{\$}$ defined
    by $$\begin{aligned}
            S &= f(x_1, x_2, \dots, x_n, \theta_1, \theta_2, \dots, \theta_n) \\
            \ket{\$} &= \ket{x_1^{\theta_1}}\ket{x_2^{\theta_2}} \dots \ket{x_n^{\theta_n}}
        
    \end{aligned}$$*

-   *The verification procedure $\texttt{Ver}(S, \ket{\$'})$ outputs $0$
    if the banknote is valid and $1$ if invalid using the following
    projective measurement
    $P = \{P_0 = \ketbra{\$}{\$}, \mathbb I- P_0\}$*
:::

We shall discuss the adaptive attacks as described in
[@adaptive_attacks] on the Wiesner Quantum money scheme.

## Quantum Lightning

Quantum Lightning was proposed by Zhandry [@quantum_lightning] as a
public-key quantum money scheme. The lightning bolt refers to a
superposition that can be sampled efficiently, but not duplicated.
Anyone can generate a random lightning bolt, and a verifier can check
that the bolt was generated honestly. The idea is to develop a sampling
procedure that makes it difficult to generate same lightning bolts as
seen by a verifier.

The authors use a collision-resistant hash function, $f_A$, and the bolt
is defined as a superposition over the pre-image of some value output by
$f_A$. That is, for some output $\ket{y}$ in the hash function range,
the lightning bolt is a superposition of all states $\ket{x}$ for $x$ in
the domain of $f_A$ such that $f_A(x) = y$.

To generate a random bolt, we use the following procedure

1.  Create a superposition over the domain of $f_A$, and apply the
    unitary corresponding to $f_A$ to the superposition

2.  The output of the unitary is stored in a separate register entangled
    with the original superposition. We measure the output register,
    which collapses to a single random eigenstate $\ket{y}$. The has $y$
    constitutes as the serial number for the bank note.

    Since the two registers were entangled, the first register becomes a
    uniform superposition over the pre-image of $y$. The first
    register's state is the bolt or the required quantum bill.

Now, since the hash function is collision-resistant, the bolt is
unclonable. If we can generate the same bolts with different serial
numbers, then that would imply a collision in the hash function raising
a contradiction. The formal definition of the quantum lightning scheme
involves more intricate constructions by tensoring multiple
*mini-bolts*. However, for our analysis we shall consider the simple
scheme described above.

## General Public Money Scheme

In particular, we shall consider a generic quantum money scheme
described as follows - Consider a randomly chosen subspace
$A \subseteq \mathbb F^{n}_2$, where $\text{dim}(A) = n/2$.

Each quantum money state is a uniform superposition of the vectors in
$A$. We denote this superposition by
$$\ket{A} = \frac{1}{\sqrt {\vert A\vert}} \sum_{a} \ket{a}.$$

Also, we know that $$H^{\otimes n} \ket{A} = \ket{A^\perp}$$

where $\text{dim}(\ket{A^\perp}) = n - \text{dim}(A) = \frac{n}{2}$.

Them the quantum money scheme is constructed as follows:

1.  Pick $A \subseteq \mathbb F^\lambda$ such that
    $\text{dim}(A) = \lambda/2$.

2.  $\text{TokenGen}(1^\lambda)$ generates $pk, \ket{\$}$ such that
    $$pk = \left\{ P_0 = \ket{A} \bra{A}, P_1 = I - \ket{A} \bra{A} \right\}, \ket{\$} = \ket{A}.$$

3.  The verification procedure can be implemented via membership oracles
    for $A$ and $A^\perp$. These are implemented in the form of unitary
    operators $U_A$ and $U_{A^\perp}$ that are applied on augmented
    qubits. We do the following:

    1.  Given a quantum state
        $\ket{\phi} = \sum_{v\in\mathbb{Z}^{n}_2} \alpha_v \ket{v}$.

    2.  Run $U_A$ on $\ket{\phi} \ket{0}$ and measure the second qubit
        to obtain $\ket{\phi'}$, $b'$.

    3.  Run $H^{\otimes n} \cdot U_A^\perp \cdot H^{\otimes n}$ on
        $\ket{\phi'} \ket{0}$ and measure the second qubit to obtain
        $\ket{\phi''}$, $b''$.

    4.  When $b' = b'' = 0$, $\ket{\phi''}$ must be equal to $\ket{A}$.

The intuition behind this scheme is that the quantum money state is
essentially a randomly chosen subspace of dimension $n/2$ from the
complete space of dimension $n$. Doing so would yield us a large number
of possible quantum bills of the order $n \choose n/2$. The attacker has
to correctly guess the subspace in order to forge a counterfeit note.

We shall analyse the soundness of this general scheme in the later
sections.

# Bomb-testing Adaptive Attack

The bomb testing algorithm described in the previous sections can be
modified, to successfully break the Wiesner Quantum Money scheme. In
particular, we can successfully determine if the state is $\ket{+}$ or
not. We first consider the simple case where only one Wiesner qubit is
used -

The algorithm is summarized as follows -

1.  Prepare $\ket{0}\ket{\phi}$.

2.  Apply $R_\theta$ on the first qubit. That is, we obtain
    $\ket{\phi'} = R_\theta \ket{0} = \cos\theta \ket{0} + \sin\theta \ket{1}$,
    where $\theta = \frac{\pi}{2N}$.

3.  Apply $\texttt{CNOT}$ to $\ket{\phi'}$ to obtain $\ket{\phi"}$. We
    also define $\psi_\theta = \cos\theta \ket{0} + \sin\theta\ket{1}$.

4.  Verify the second qubit of $\ket{\phi"}$.

5.  Repeat the procedure for $N$ steps.

It can be shown that the bank's probability of detecting a counterfeit
is at most $O(1/N)$ when the bank note is $\ket{0}, \ket{1}$. When the
bank note is $\ket{+}$, the measurement of the probe qubit will yield
$1$ with certainty. Otherwise, the outcome will be $0$. The scheme can
be extended to an $n$-state system wherein the quantum bill given by
$$\begin{aligned}
    \ket{q} = \ket{q_1} \ket{q_2}\dots \ket{q_n}
\end{aligned}$$

where each $\ket{q_i}$ is $\ket{H^\theta X}$ for
$X, \theta \in \{0, 1\}$. The counterfeiter prepares the following state
keeping $\ket{q_1}$ aside -

$$\begin{aligned}
    \ket{q^{(1)}} = \ket{\psi}\ket{q_2} \dots \ket{q_n} 
\end{aligned}$$

where $\psi$ is the modified Wiesner bit that is coupled with a probe
qubit. Each of the individual Wiesner states can be determined, changing
each qubit one after the other.

## Further Generalization

We consider a more general Wiesner's scheme in which we use $d$
dimensional qubits. We choose $n$ random states from
$\{ \ket{\beta_1}, \ket{\beta_2}, \dots, \ket{\beta_r}\}$, where each
$\ket{\beta_i} \in \mathcal C^d$. Let
$\theta_{min} = \min_{ 1 \leq i \neq j \leq r} \arccos \vert \langle \beta_i\vert \beta_j \rangle \vert$.
For example, in the previous scheme, the set of random states is
$\{\ket{0}, \ket{1}, \ket{+}, \ket{-}\}$ with $\theta_{min} = \pi/4$.

In the previous attack, we essentially found an operator $R$ such that
$R \ket{+} = \ket{+}$ and not for the other states. In a similar way,
given a generate state $\ket{alpha}$ from a set of arbitrary quantum
states, we aim to find a unitary $R$ such that
$R \ket{\alpha} = \ket{\alpha}$. One such potential operator is to use
the *controlled reflection* $R = 2 \ketbra{\alpha}{\alpha} - \mathbb I$
instead of the controlled $X$ as before.

Assuming we know the set of arbitrary states
$\{\ket{\beta_1}, \ket{\beta_2}, \dots, \ket{\beta_r}\}$, the idea is to
select a $\ket{\beta}$ from the set, and check if the unknown state
$\ket{\alpha}$ is same as our chosen state. The procedure can be
repeated for all the available quantum states to identify the unknown
state. The operator $R$ behaves in the following manner
$$\begin{aligned}
    R \ket{\alpha} = \cos (2\theta) \ket{\alpha} + \sin(2\theta) \ket{\alpha^\perp}
\end{aligned}$$

where $\cos \theta = \langle \alpha \vert \beta \rangle$

The algorithm is summarized as

1.  Prepare a probe qubit $\ket{0}$.

2.  At the $k$th step, the state of the probe qubit is given by
    $\ket{\phi_k}$. We apply a rotation $R_\delta$ to the probe qubit to
    obtain
    $\ket{\psi_{(\phi_k + \delta)}} = \cos(\phi_k + \delta) \ket{0} + \sin (\phi_k + \delta) \ket{1}$
    where $\delta = \frac{\pi}{2N}$.

3.  The probe and the unknown qubit are coupled. The controlled $R$
    operator defined as $$\begin{aligned}
            C_R = \cos (\phi_k + \delta) \ket{0}\ket{\alpha} + \sin (\phi_k + \delta) \cos (2\theta) \ket{1} \ket{\alpha} \\
            + \sin(\phi_k + \delta) \sin (2\theta) \ket{1} \ket{\alpha^\perp}
        
    \end{aligned}$$ The operator $C_R$ is applied on the joint state.

4.  The second register is measured and the procedure is repeated for
    $N$ steps.

The probability of getting caught in the $k$th round can be calculated
as $\sin^2(2\theta) \sin^2(\phi_k + \delta)$, and after successful
verification, the (unnormalized) residual state is $$\begin{aligned}
    &\left(\cos(\phi_k + \delta) \ket{0} +\cos(2\theta)\sin(\phi_k + \delta)\ket{1}\right)\ket{\alpha} \\
    &= \ket{\phi_{k + 1}} \ket{\alpha}
\end{aligned}$$

The transformation can be represented as $$\begin{aligned}
    \ket{\phi_{k + 1}} &= \begin{bmatrix}
        1 & 0 \\ 0 & \cos(2 \theta)
    \end{bmatrix} R_{\delta} \ket{\phi_k} \\
    &= \label{eq:T} \begin{bmatrix}
        \cos \delta & -\sin \delta \\ q\sin\delta & q\cos \delta 
    \end{bmatrix}\ket{\phi_k} = T \ket{\phi_k}
\end{aligned}$$

where $q = \cos (2\theta)$. At the end of $N$ steps, we have
$T^N\ket{0}$. Consider the following cases

1.  Our guess is correct, i.e, $\theta = 0$. Then, $q = 0$,
    $T = R_\delta$, and $\langle 1 \vert T^N \vert 0 \rangle = 1$, and
    the probe qubit is rotated to $\ket{1}$. We never get caught in this
    case.

2.  Our guess is perpendicular to the unknown state, i.e,
    $\theta = \pi/2$. Then, $q = -1$ and $T^2 = \mathbb I$. Hence, after
    an even number of rounds $\langle 0 \vert T^N \vert 0 \rangle = 1$,
    and we are never caught.

3.  When our guess makes an arbitrary angle with the unknown state, i.e,
    $\theta_{min} \leq \theta < \pi/2$. Then, $\| q\| < 1$. For large
    $N$, we have $$\begin{aligned}
            T = \begin{bmatrix}
                1 & - \delta \\
                q \delta & q 
            \end{bmatrix} + \Delta T
        
    \end{aligned}$$ with $\|\Delta T \| = O(\delta^2)$. Now,
    $$\begin{aligned}
            T^N \ket{0} &= T^N \begin{bmatrix}
                1 \\ 0
            \end{bmatrix} = T^{N - 1}\begin{bmatrix}
                1 \\ \delta q
            \end{bmatrix} + \underbrace{T^{N - 1} \Delta T \begin{bmatrix}
                1 \\ 0
            \end{bmatrix}}_{\ket{v_1}} \\
            &= T^{N - 2}\begin{bmatrix}
                1 \\ 0
            \end{bmatrix} + \underbrace{T^{N - 2}\left(\begin{bmatrix}
                -\delta^2 q \\ 0
            \end{bmatrix} + \Delta T \begin{bmatrix}
                1 \\ \delta q
            \end{bmatrix}\right)}_{\ket{v_2}} + \ket{v_1} \\
            &\vdots \\
            &= \begin{bmatrix}
                1 \\ \delta (q + q^2 + \cdots + q^N)  
            \end{bmatrix} + \sum_{i \in [N]} \ket{v_i}
        
    \end{aligned}$$

    The norms of the error vectors $\ket{v_i}$ can be bounded as
    $$\begin{aligned}
            \ket{v_k} &= T^{N - k}  \left(\begin{bmatrix}
                -\delta (q + q^2 + \cdots + q^{k - 1}) \\ 0  
            \end{bmatrix} + \Delta T  \begin{bmatrix}
                1 \\ \delta (q + q^2 + \cdots + q^{k - 1})  
            \end{bmatrix} \right) \\
            \| \ket{v_k} \| &\leq \mathcal O \left(\delta\left(1 + q + \dots + q^{k - 1}\right)\right) \leq \mathcal O \left(\frac{\delta^2}{1 - q}\right)
        
    \end{aligned}$$ because $\|T \| \leq 1$ from
    [\[eq:T\]](#eq:T){reference-type="ref" reference="eq:T"}. We then
    have,

    $$\begin{aligned}
            \langle 0 \vert T^N \vert 0 \rangle \geq 1 - N \| \ket{v_N}\| \geq 1 - \mathcal O\left(\frac{N \delta^2}{1 - q}\right) \geq 1 - \mathcal O(N^{-1} \theta^{-2}_{min})
        
    \end{aligned}$$

    using $1 - q = \Omega(\theta^2)$ for small $\theta$

    In conclusion, we can choose an $N$ of the order
    $f^{-1}\theta_{min}^{-2}$ to get
    $\|\langle 0 \vert T^N \vert 0 \rangle \|^2 > 1 - f$. Now, since we
    repeat this over all the $r$ quantum states from the set, and we
    need to identify all the $n$ qubits, the complexity of the algorithm
    becomes $\mathcal O(r^2 n^2f^{-1} \theta_{min}^{-2})$. The square on
    $rn$ appears because the failure probability for each procedure
    needs to be modified as $f' = f/nr$ to bound the total failure
    probability of the procedure.

    Furthermore, we can parallelise the procedure, wherein we attach the
    probe qubits to all of the $n$ states simulataneously and query the
    verification procedure. The failure probability does not increase
    because the verification in this scheme is done on each qubit
    independently. Therefore, the final runtime complexity of the
    algorithm reduces to $\mathcal O(r^2 nf^{-1} \theta_{min}^{-2})$

When $\theta_{min}$ is arbitrarily close to $0$, i.e, the states are
continuous, the attack described above fails. In this case, the attacker
has to arbitrarily choose a $\theta_{min}$ to proceed with the attack.
Simply put, since there is no true bound on the value of
$\theta_{\min}$, we cannot find the number of iterations. Our best bet
is to guess a value, and check if that works.

Doing so, will add a new case in the above description, where
$0 < \theta < \theta_{min}$. If we repeat the above procedure for an
arbitrary number of steps, the *cumulative probability* of failure
increases.

To understand this intuitively, $\theta_{min}$ gave us the approximate
upper bound on how much the probe qubit rotates. If the $\theta_{min}$
is close to $\theta$, then we can find an approximate $N$ such that the
probe qubit rotates by $\pi/2$ at the end of $N$ rounds. However, if we
there is no correlation between $\theta_{min}$ and $\theta$, which is
the case when the states are continuous and we take a guess, the probe
qubit rotates by an arbitrary amount at the end of $N$ steps. Moreover,
if the probe qubit is very close to $\ket{1}$ during the procedure, the
coupling between probe and system state becomes strong, and the
operation $R$ is applied on the system qubit with a very high
probability. The state $R\ket{\beta}$ has a high chance of failing the
verification protocol as we cycle through all the possible states.

In the next section, we shall see an attack based on protective
measurements which is able to tackle this case.

# Protective Measurement Attack

The idea of a protective measurement attack is similar. We define an
operator $A$, and find its expectation value
$\langle A \rangle = \langle \psi \vert A \vert \psi \rangle$ on the
state $\ket{\psi}$. The classical information can then be used to
reconstruct $\ket{\phi}$ accurately.

The gist of the attack is as follows - we prepare a probe with the
initial state $\ket{0}$, choose $\delta = \frac{c}{N}$ for some constant
$c$, and repeat the following procedure for $N$ steps -

-   Weakly couple the probe and the system

-   Send the state to the bank for validation

We expect the following - $$\begin{aligned}
        \ket{0}\ket{\psi} & \xrightarrow{e^{-i\delta (\sigma_x \cOtimes A)}} \approx \ket{0}\ket{\psi} - i\delta \ket{1}A\ket{\psi} \\
        &\xrightarrow{\text{bank measures} \{\ket{\psi}\bra{\psi}, \mathbb I - \ket{\psi}\bra{\psi}\}} \approx \left(e^{-i \delta \lang A \rang \sigma_x} \ket{0}\right) \cOtimes \ket{\psi} \\
        &\xrightarrow{\text{repeat } N \text{ times}} \approx \left(e^{-i N\delta \lang A \rang \sigma_x} \ket{0}\right) \cOtimes \ket{\psi} 
\end{aligned}$$

By measuring the probe, we can approximate $\lang A\rang$ and thus
$\ket{\psi}$.

## Construction

The building block of this attack is to ensure *weak interaction*
between the probe and the system. As mentioned in Section
[2.4](#sec:pm){reference-type="ref" reference="sec:pm"}, we use a
dichotomic observable $A = P - P^\perp$ where $P$ is the projection on
the $+1$ eigenspace of $A$.

The crucial difference from the approaches in []{#sec:wiesner_attack
label="sec:wiesner_attack"} is that, instead of applying $\delta$
rotation and a controlled operator, we use the unitary coupling
operation defined as $$\begin{aligned}
    U &= e^{-i \delta (\sigma_x \otimes A)} =  e^{-i \delta (\sigma_x \otimes P - \sigma_x \otimes P^\perp)} \\
    &= e^{-i \delta \sigma_x \otimes P} e^ {i\delta \sigma_x \otimes P^\perp} = e^{-i \delta \sigma_x} \otimes P + e^{i \delta \sigma_x} \otimes P^{\perp} 
\end{aligned}$$

As before, we assume the first part of the system is the probe followed
by the unknown state to the right of the tensor product. We choose
$\delta = \frac{c}{N}$ for an appropriate value of $c$. Here, if the
probe state is close to $1$, the unknown state is not affected in a
significant manner unlike before.

## Obtaining the expectation value of $A$

We have the following lemma,

::: lemma
**Lemma 1**. *For any dichotomic observable $A$ there exists a
protective measurement protocol with running time $N$, accuracy
$\mathcal O(1/N)$ and failure probability $\mathcal O(1/N)$*
:::

::: proof
*Proof.* Consider an arbitrary initial state of the probe qubit
$\ket{\phi_0}$. After $k$ steps, we obtain $\ket{\phi}$ and
$\ket{\alpha}$ on the second register assuming we did not fail in the
$k$ rounds.

At the $k+1$th step, on applying $U$, we get $$\begin{aligned}
        W \ket{\phi_k} = (\mathbb I\otimes\bra{\alpha}) U \ket{\phi_k} \ket{\alpha} = \sqrt{p_k} \ket{\phi_{k + 1}} 
    
\end{aligned}$$ where $p_k$ represents the probability of success in the
$k$th step.

The expression for $W$ is given by $$\begin{aligned}
        W &= \langle \alpha \vert P \vert \alpha \rangle e^{-i \delta \sigma_x} + \langle \alpha \vert P^\perp \vert \alpha \rangle e^{i \delta \sigma_x} \notag\\
        &= \cos \delta \langle \alpha \vert P + P ^\perp \vert \alpha \rangle \mathbb I- i \sin \delta \langle \alpha \vert P - P ^\perp \vert \alpha \rangle \sigma_x \notag\\
        &= \cos \delta \mathbb I- i \sin \delta \langle A \rangle \sigma_x \\
    
\end{aligned}$$

The matrix $W$ has the eigenvalues
$\lambda_{\minusplus} = \cos \delta \minusplus i \langle A \rangle \sin \delta$
corresponding to eigenstates $\ket{+}, \ket{-}$. Then,

$$\begin{aligned}
        W^N \ket{\phi_0} = \left(\prod_{k = 0}^{ N - 1} \sqrt{p_k}\right) = \sqrt{p}\ket{\phi_N}
    
\end{aligned}$$

where $p$ is the probability of succeeding in all the $N$ validation
steps. For large $N$, $$\begin{aligned}
        \lambda_{\minusplus}^N &= (\cos \delta \minusplus i \sin \delta \langle A \rangle)^N  \\
        &= \left(e^{\minusplus i \delta \langle A \rangle} + \mathcal O(\delta^2) \right) \\
        &= \left(e^{\minusplus i \delta \langle A \rangle}(1 + \mathcal O(\delta^2)) \right) \\
        &= e^{\minusplus iN \delta \langle A \rangle ( 1 + N \mathcal O(\delta)^2) = e^{\minusplus ic \langle A \rangle} + \mathcal O(N^{-1})
    
\end{aligned}$$

Therefore, for large $N$, $$\begin{aligned}
        W^N &= \lambda^N_1 \ketbra{+}{+} + \lambda^N_2 \ketbra{-}{-} \\
        &= (e^{-ic\langle A \rangle} \ketbra{+} (e^{ic\langle A \rangle} \ketbra{-} + O(1/N) (\ketbra{+} + \ketbra{-}) \\
        &= \cos (c\langle A \rangle) (\ketbra{+} + \ketbra{-}) - \sin (c \langle A \rangle) (\ketbra{+} - \ketbra{-}) + O(1/N) \mathbb I \\
        &= \cos (c\langle A \rangle)\mathbb I - \sin (c \langle A \rangle) \sigma_x + O(1/N) \mathbb I \\
        W^N &= e^{-ic \langle A \rangle \sigma_x} + \mathcal O(1/N)
    
\end{aligned}$$

At the end of $N$ steps, the probe gets rotated by an amount
proportional to $\langle A \rangle$. The final state can be written as
$$\begin{aligned}
        \ket{\phi_N} = e^{-ic \langle A \rangle \sigma_x} \ket{\phi_0} + \mathcal O(1/N) \ket{\phi'}
    
\end{aligned}$$

for some error state $\ket{\phi'}$. The value of $p$ can then be
estimated as $1 - \mathcal O(1/N)$. ◻
:::

To understand this better, consider the Wiesner states
$\ket{X^\theta}$ - We choose $A = \sigma_x$, $c = \frac{\pi}{2}$,
$\ket{\phi_0} = \ket{0}$. Then, we get
$\langle 0 \vert \sigma_x \vert 0 \rangle = \langle 1 \vert \sigma_x \vert 1 \rangle = 0$
and
$\langle + \vert \sigma_x \vert + \rangle = - \langle - \vert \sigma_x \vert - \rangle = 1$.
The final probe state when the unknown state is initially $\ket{+}$ or
$\ket{-}$ is $W^N \ket{0} = \minusplus i \ket{1}$. Otherwise, the probe
will remain close to $\ket{0}$. Therefore, we can compute $\theta$ with
certainty, which can then be used to find $X$ as well.

In a general case, we generate many copies of $\ket{\phi_N}$ and measure
it in $\sigma_y$ basis to get the estimate of $\langle A \rangle$. The
result is formally stated in the following lemma.

::: lemma
**Lemma 2**. *For any $\nu, \eta, f > 0$, it is possible to use a
protective measurement protocol to estimate $\langle A \rangle$ with
precision at least $\nu$, confidence at least $1- \eta$, probability of
failure $\mathcal O(f)$ and running time
$\mathcal O(f^{-1} \nu^{-4} \ln^2(\eta^{-1})$*
:::

::: proof
*Proof.* We run the above mentioned protocol for
$m = 336 \ln (2 \eta^{-1}) \nu^{-2}$ times with $N = m/f$. The total
running time for this procedure is
$mN = \mathcal O(\ln^2(\eta^{-1}) \nu^{-4} f^{-1})$, and the overall
failure probability is $\mathcal O(f)$. We set the parameter
$c = \frac{\pi}{8}$ for optimality, and obtain $m$ copies of
$\ket{\phi_N}$ $$\begin{aligned}
        \phi_{N} = \cos \left(\frac{\pi}{8}\langle A \rangle\right) \ket{0} - i \sin  \left(\frac{\pi}{8} \langle A \rangle\right) \ket{1} + \mathcal O\left(\frac{1}{N}\right) \ket{\phi'}
    
\end{aligned}$$

We measure this state in $\sigma_y = \begin{bmatrix}
        0 & -i \\ i & 0
    \end{bmatrix}$ basis $m$ times. Considering
$\ket{y_+} = \frac{1}{\sqrt{2}}[\ket{0} - i \ket{1}]$, let $\bar p$ be
the probability of obtaining $+1$ as the measurement outcome and
$p^{(m)}$ be the empirical frequency of $+1$. Then, $$\begin{aligned}
\label{eq:bar_p}
        \bar p = \| \langle y_+ \vert \phi_N \rangle \|^2 &= \frac{1}{2} \| \cos \left(\frac{\pi}{8}\langle A \rangle\right) -  \sin  \left(\frac{\pi}{8} \langle A \rangle\right) + \mathcal O\left(\frac{1}{N}\right) \|^2 \\
        &= \frac{1}{2} \left(1 - \sin \left(\frac{\pi}{4} \langle A \rangle\right) + \mathcal O\left(\frac{1}{N}\right)\right)
    
\end{aligned}$$

Since $\|\langle A \rangle\| \leq 1$, the expectation value $\bar p$ is
well bounded away from $0$ - $$\begin{aligned}
        \bar p \geq \frac{1}{2} - \frac{1}{\sqrt{8}} + \mathcal O\left(\frac{1}{N}\right) \geq \frac{1}{7}
    
\end{aligned}$$

Let $\tilde \nu = \nu/4$, then $$\begin{aligned}
        m = \frac{336\ln(2/\eta)}{\nu^2} \geq \frac{3\ln(2/\eta)}{\tilde nu^2 \bar p}
    
\end{aligned}$$

Using Chernoff bound, the probability that
$\| p^{(m)} - \bar p\| \geq \tilde \nu \bar p$ is at most
$$\begin{aligned}
        2 \text{exp} \left(-\frac{\tilde v^2 m \bar p}{3} \right) \leq \eta
    
\end{aligned}$$

The above result establishes that $p^{(m)}$ is within
$\nu/4 \bar p \leq \nu/4$ of $\bar p$. Using the expression from
[\[eq:bar_p\]](#eq:bar_p){reference-type="ref" reference="eq:bar_p"}, we
get $$\begin{aligned}
        \arcsin \left(1 - 2p^{(m)} - \frac{\nu}{2} - \mathcal O\left(\frac{1}{N}\right) \right) \leq \frac{\pi}{4} \langle A \rangle \leq\arcsin \left(1 - 2p^{(m)} - \frac{\nu}{2} + \mathcal O\left(\frac{1}{N}\right) \right)
    
\end{aligned}$$

The precision of $\langle A \rangle$ can be analysed using the Taylor
series expansion. We obtain the result $$\begin{aligned}
        \left\vert \langle A \rangle - \frac{1}{\pi} \arcsin \left(1 - 2 p^{(m)} \right)\right\vert \leq \nu
    
\end{aligned}$$

Therefore, the value of $\langle A \rangle$ is estimated as
$\frac{4}{\pi} \arcsin \left(1 - 2p^{(m)}\right)$ with precision $\nu$
and confidence $1 - \eta$. ◻
:::

## Obtaining $\ket{\alpha}$ from $\langle A \rangle$

The quantum state $\ket{\alpha}$ is obtained from $\langle A \rangle$
using Protective Tomography.

::: definition
**Definition 8** (Protective Tomography). *A protocol achieves
protective tomography with infidelity $\epsilon$, confidence $1 - \eta$,
failure probability $f$ and running time $t$ if it outputs a classical
description of a mixed state $\rho$ such that*

-   *The probability of failure (the output is $\mathbb I - \Pi$ for
    some step), is $\mathcal O(f)$*

-   *If the algorithm does not fail, the fidelity
    $F(\ket{\alpha}, \rho) \geq 1 - \epsilon$ with probability atleast
    $1 - \eta$*

-   *The algorithm uses at most $t$ validations*
:::

We have the following lemmas

::: lemma
**Lemma 3**. *There exists a protective tomography protocol for a qubit
system with dimension $d$ and running time scaling as
$t = \mathcal O(d^{12} f^{-1} \epsilon^{-4} \ln^2(d^{2}\eta^{-1}))$.*
:::

::: lemma
**Lemma 4**. *There exists a protective tomography protocol for
$n$-qubit states of the form
$\ket{\alpha} = \otimes_{i \in [n]} \ket{\alpha_i}$, with running time
$t = \mathcal O(n^{5} f^{-1} \epsilon^{-4} \ln^2(n\eta^{-1}))$.*
:::

::: proof
*Proof.* Using the procedure described above, we can obtain
$\langle \tilde \sigma_j \rangle$ for $j \in \{x, y, z\}$ - the
approximated values of the Pauli matrices
$\langle \sigma_j \rangle = \langle \alpha \vert \sigma_j \vert \alpha \rangle$,
with precision parameters
$\nu = \epsilon/6, \tilde \eta = \eta/3, \tilde f = f/3$. The running
time for all the algorithms would then be $$\begin{aligned}
        t &= 3 \mathcal O(\tilde f^{-1}\tilde \nu^{-4} \ln^2(\tilde \eta^{-1}) \\
        &= \mathcal O(f^{-1}\nu^{-4} \ln^2(\eta^{-1})
    
\end{aligned}$$ and the failure probability $f = 3\tilde f$ using the
union bound. Similarly, the confidence bound can also be obtained as
$1 - \nu$. The approximation of $\ket{\alpha}$ is given by
$$\begin{aligned}
        \tilde \rho = \mathbb I/2 + \sum_{j \in \{x,y,z\}} \langle \tilde \sigma_j \rangle\sigma_j
    
\end{aligned}$$ with fidelity at least $1 - \epsilon$ and confidence at
least $1 - \eta$.

However, this matrix is not necessarily positive semi-definite with
trace $1$. Therefore, we choose $\rho$ to be the closest state that is
$\rho = \text{argmin}\, D(\tilde \rho, \tau)$, where $\tau$ runs over
all single-qubit mixed states and $D$ is the trace distance
$D(\alpha, \beta) = \frac{1}{2} ||\alpha - \beta||_{\text{tr}}$ and
$||A||_{\text{tr}} = \text{Tr}(\sqrt{AA^\dagger})$. Using the triangle
inequality and the definition of $\rho$, we get $$\begin{aligned}
        D(\rho, |\alpha\rangle\langle\alpha|) \leq D(\rho, \tilde\rho) + D(\tilde\rho, |\alpha\rangle\langle\alpha|) \leq 2D(\tilde\rho, |\alpha\rangle\langle\alpha|)
    
\end{aligned}$$ Then the fidelity of the final state is $\epsilon$ with
probability at least $1 - \eta$. ◻
:::

# Duplication in Public-key money

## Soundness Analysis

Let us analyse what happens to the verification procedure when we use a
forged state. Suppose the true state is sampled from the subspace $A$
with dimension $n/2$. Let the unknown state be
$\ket{\alpha} = \sum_{v \in A} \alpha_v \ket{v}$.

Now, we guess a vector in subspace $B$ of dimension $n/2$. Let the
forged state be $\ket{\beta} = \sum_{v \in B} \beta_v \ket{v}$ Let
$S = A \cap B$ and $| A \cap B | = m$. For simplicity, let us work with
subspace states.

$$\begin{aligned}
    U_A \ket{B}\ket{0} &= \ket{S}\ket{0} +  \ket{B - S}\ket{1} \\ 
    \ket{\phi'} &\propto \ket{S}
\end{aligned}$$

The probability of obtaining $0$ on measuring the second qubit is given
by $\left(\vert S \vert /\vert B\right) \vert = 2m/n$. Assuming we are
successful here, we apply the Hadamard operator to obtain
$$\begin{aligned}
    H^{\otimes^n} \ket{\phi'} \propto \ket{S^\perp}
\end{aligned}$$

The applying the unitary operator $U_{A^\perp}$, we get
$$\begin{aligned}
    U_{A^\perp} H^{\otimes^n} \ket{\phi'} \ket{0} &\propto \ket{A^\perp \cap S^\perp} \ket{0} + \ket{A \cap S^\perp} \ket{1}
\end{aligned}$$

Now, $S^\perp = A^\perp \cup B^\perp$. Therefore,
$A \cap S^\perp = A \cap B^\perp$, and $A^\perp \cap S^\perp = A^\perp$.
We then have

$$\begin{aligned}
    U_{A^\perp} H^{\otimes^n} \ket{\phi'} \ket{0} &\propto \ket{A^\perp} \ket{0} + \ket{A \cap B^\perp} \ket{1}
\end{aligned}$$

The probability of obtaining $0$ on the second qubit in this case is
given by
$\left(\vert A^\perp \vert / (\vert S^\perp \vert) \right) = \frac{n}{2(n - m)}$.

Upon successful verification, we obtain the state
$\ket{A^\perp \cap S^\perp}$. The probability of success is calculated
as $\frac{2m}{n} \times \frac{n}{2(n - m)} = \frac{m}{n - m}$. It can be
seen that the probability of success if highest when $m$ is close to
$n/2$, i.e, we guess the subspace correctly.

[*Note.* I tried to extend the protective measurement attack to these
schemes to estimate the subspace rather than a single state.
Unfortunately, I could not make any progress in that aspect. I will
think about it more from other perspectives. However, I am skipping
these aspects in the report for the project submission for
now.]{style="color: gray"}

# Conclusion

We discussed the motivation to develop secure quantum money protocols
and how quantum systems have the potential to be used in these areas.
Wiesner Quantum Money scheme has been widely adopted across literature,
and we analysed the protocol in detail. The attacks discussed in the
analysis can easily be prevented if the bank returns a new quantum bill
when the detected error in the input quantum state is above a certain
threshold. However, such approaches have practical limitations as
generating new bills is an expensive operation.

In conclusion, the general secret-key schemes possess these security
threats that make the commonly proposed systems ineffectual. The
research for public-key schemes is still ongoing, and we are still at
far with regards to such protocols.

Nevertheless, the attacks presented in the report also depict the
interesting properties of quantum phenomena such as the Zeno effect and
protective measurements. These properties have vast potential
applications for general quantum systems, and the analysis will help
further our understanding of the quantum computing in general.
