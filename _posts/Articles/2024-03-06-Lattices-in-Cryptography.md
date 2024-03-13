---

layout: post
title: Lattices in Cryptography and Quantum Computers
categories: [Notes]
excerpt: Introduction to lattice problems and their relevance in post-quantum cryptography. A brief discussion of the current state of quantum computers.
toc: 
  sidebar: true
  
---

## Lattices

Lattices are the most promising candidate for quantum security. We have been studying these problems since many years, and there is a significant amount of research in this topic. There are other schemes based on other assumptions like code based cryptographies, etc. These are important in the case Lattices are broken since these have completely independent assumptions.

What is Lattice? A Lattice is defined over a space $$\mathbb R^n$$ consisting of $$m$$ linearly independent vectors $$b_1, \dots, b_m$$. We refer to the matrix $$B = (b_1, \dots, b_m)$$. Then,

$$ \mathcal L(B) = \left\{ \sum_{i} x_i b_i  \vert  z_i \in \mathbb Z \right\} $$

We usually consider $$m = n$$ in analysis. For example, in $$\mathbb R^2$$, $$b_1 = (1, 2)^T, b_2 = (2, 1)^T$$. This is equivalent to considering the integer grid points in the basis $$B$$. This is a countable space unlike a normal vector space. A lattice is not unique to set of basis vectors! Any basis of the form $$x_1b_1 + x_2 b_2, y_1 b_1 + y_2 b_2$$, where $$x_1y_2 - x_2y_1 = \pm 1$$ and $$x_1, x_2, y_1, y_2 \in \mathbb Z$$ will have the same basis.

Consider a few computational problems in Lattices - 

- Given $$v, B$$, compute whether $$v \in \mathcal L(B)$$. This is polynomial computable using Gaussian elimination.
- Given $$B, B’$$, compute whether $$\mathcal L(B) = \mathcal L(B’)$$. This is polynomial computable as well, using the above problem. An equivalent way to find this is to consider $$B = UB’$$ iff $$U$$ has integer entries and $$det(U) = \pm 1$$ as seen above.
- SVP (Shortest Vector Problem) - Given a basis $$B$$ in $$\mathbb R^n$$, find the non-zero shortest vector in $$\mathcal L(B)$$. This is computationally hard for higher $$n$$ (quantumly hard too). An approximation is given by $$SVP_\gamma$$ aims to find $$v \in \mathcal L(B)$$, $$\|v\| \leq \gamma \|\text{shortest}\|$$.
- CVP (Closest Vector Problem) - Given a basis $$B \in \mathbb R^n$$ and $$v \in \mathbb R^n$$, find $$v \in \mathcal L(B)$$ such that $$\|u - v\|$$ is minimized. This problem is equivalent to the above problem.

Conjectures - SVP and CVP are quantumly hard!

Can we use NP-complete problems for cryptography? Most of these problems are worst-case hard, and there are good approximation algorithms for the average case. So with these problem constructions, we are looking for average-case hard complexity. The knapsack problem, for example, is related to Lattice problems.

How can we construct public key cryptography schemes with lattices? The basis assumption is that computing a ‘good’ basis from a ‘bad’ basis is intractable. For example, consider the following

- A secret key is constructed using a ‘good’ basis (for CVP) - $$B$$
- A public key is constructed using a ‘bad’ basis - $$B’$$
- $${\sf Enc} (pk, m) \to \text{ sample } v \in \mathcal L(B')$$ such that $$v$$ encodes $$m$$. The cipher text is $$u = v + \eta$$ where usually $$\eta \sim \mathcal N(0, \sigma^2)$$ so that the problem reduces to CVP
- $${\sf Dec}(sk, u)$$ recovers $$v$$ using $$B$$.

There are more computationally hard problems like the SIS (Shortest Integer Solution) and LWE (Learning with Errors). SIS and LWE can be reduced to one another and both of them are harder than $$SVP/SVP_\gamma$$ and $$CVP/CVP_\gamma$$. For example, Learning With Errors is much harder problem - it is average case hard if $$CVP_\gamma$$ is worst case hard for $$\gamma = {\sf poly}(n)$$. 
These problems, especially LWE, present a new paradigm in cryptography known as *homographic encryption*. The idea is that any operations performed on the messages (decrypted space) can be reflected in the encrypted space. For example, say we are encrypting photos uploaded to the cloud. If you are adding a new picture, then we should be able to encrypt the new data alongside the old one without recomputing the encryption for the data as a whole again. In homographic encryption, we need not perform the encryption again for all the set of pictures, but rather just on the new picture and append it to the old data. 

Let us see the definitions of these problems -

- Shortest Integer Solution - Let $$A \in \mathbb Z^{n \times m}_q$$, $$A = (a_1, \dots, a_m)$$ $$a_i \in \mathbb Z_q$$. The goal is to find $$z \in \mathbb Z^m$$ such that
    - $$Az \equiv 0 ({\sf mod } q)$$
    - $$z$$ is ‘short’ - $$\|z\|_2 \leq \beta$$ and $$z \in \{-1, 0, 1\}^m$$
    
    The parameters used to define this problem are given by $$m = {\sf poly} (n)$$, $$q = {\sf poly} (n)$$ and $$\beta = c \sqrt{m}$$ for some $$c \in \mathbb R$$. These parameter choices can be chosen to be something else if the theoretical bounds exist, but this particular set of parameters can be reduced to $$CVP_\gamma$$ where $$\gamma = \mathcal O(n)$$.
    
    There is a variant of this problem known as Inhomogeneous Short Integer Solution (ISIS) - We equate $$Az \equiv t ({\sf mod}  q)$$ instead of equating to $$0$$. 
    
    How are these related to lattices? All solutions $$Az \equiv 0 ({\sf mod } q)$$ form a lattice defined by
    
    $$ L^\perp(A) = \left\{z \in \mathbb Z^m \vert Az \equiv 0 ({\sf mod } q)\right\} $$
    
    Consider any $$z_1, z_2 \in \mathcal L^\perp(A)$$, then it is easy to see that for any $$a, b \in \mathbb Z$$, $$A(az_1 + bz_2) \equiv 0({\sf mod}q)$$. Let us define a cryptographic application to get a gist of how we use these problems -
    
    1. Collision-Resistant Hash Function - The security for such a function is that, given the description of such a hash function, it is *difficult* to find a collision. Using Grover’s Algorithm, typical hash functions can be broken with a quadratic speed-up as compared to classical algorithms. Here, we construct a hash function using SIS that cannot be broken with Grover’s - 
        - Construction - Sample $$A \in \mathbb Z_q^{m\times n}$$, $$f_A(x \in \{0, 1\}^m) = Ax ({\sf mod} q)$$. Unlike SIS, the input here is binary rather than from $$\mathbb Z_q$$.
        - Security - Assume we find $$x, x’$$ such that $$f_A(x) = f_A(x’) \implies A(x - x') \equiv 0 ({\sf mod} q)$$. Since $$x, x’ \in \{0, 1\}^m$$, $$x - x’ \in \{-1, 0, 1\}^m$$.
        
        There are other implementations more efficient that this construction, but it acts like a good starting point.
        
    2. Signatures (GPV Signature)  - Unlike the previous case, this is the most efficient construction we know for public key cryptography. For a signature, we need to define the constructions for a verification key $$vk$$ and a signing key $$sk$$ - a trapdoor $$T$$ to help us find solutions for ISIS. 
        - $$Sign(sk, m)$$ maps $$m \mapsto t \in \mathbb Z_q^m$$, use $$T$$ to find $$v$$ such that $$Av \equiv t ({\sf mod} q)$$ and set $$sk = \sigma = v$$.
        - $$Ver(vk, m, \sigma)$$ maps $$m \mapsto t \in \mathbb Z_q^m$$, check whether $$A \sigma \equiv t ({\sf mod} q)$$ and $$\sigma$$ is ‘short’.
        
        Intuitively, we are able to find a secret key $$v$$ using a trapdoor that satisfied ISIS. The verification procedure is simple wherein $$v$$ can be verified to be short and satisfying the modulus equation. 
        
        The research for $$T$$ concluded in 2010’s. The gist of the trapdoor is the following - suppose we sample $$A \in \mathbb Z^{n \times m}_q$$ and $$t \gets \text{ all short vectors}$$. Then, we construct $$A' = [A \vert  \texttt{-}At] \equiv A' \in \mathbb Z_1^{n \times (m + 1)}$$. Then $$t’ = (t, 1)^T$$ satisfies $$A’t’ \equiv 0({\sf mod} q)$$.  
        
        The National Institute of Standards and Technology (NIST) submitted FALCON and DILITHIUM based on GPV signatures along with other building blocks for post-quantum cryptography. 
        
    
    The SIS problem still has limited structure limiting its applications. Next, we shall see LWE which allows us to construct many cryptographic schemes.
    
- Learning With Errors (LWE) - The parameters used in this problem are $$n, m , q, \mathcal X$$ where $$m,q = poly(n)$$ and $$\mathcal X$$ is an error probability distribution. The problem is as follows - say there is a uniformly random $$s \in \mathbb Z_q^n$$, then the goal is to given $$m = poly(n)$$ samples of  $$\langle a_i, s\rangle + \eta_i \equiv ({\sf mod} q)$$ where $$a_i \in \mathbb Z_q^n$$ and  $$\eta \sim \mathcal X^m$$, determine $$s$$. Note that if there were no error involved, then this problem is very easy - perform Gaussian elimination to recover $$a_i$$. $$\mathcal X$$ is typically chosen as a Gaussian distribution modified to work with the $$\mathbb Z_q$$ space -
    
    $$ \Psi_\alpha = \text{sample } v \in \mathbb Z_q \\ \text{w.p. proportional to } \left(e^{\frac{-|v|^2}{\alpha^2}}/c\right) $$
    
    where $$\alpha = \mathcal O\left(1/\sqrt{n}\right)$$. 
    
    More elegantly, the LWE problem is described using a matrix formulation - 
    
    Given $$A \in \mathbb Z^{n \times m}_q$$  and $$e \sim X^m$$ , determine $$s \in Z_q^n$$ from $$s^T A + e^T ({\sf mod} q)$$. This is known as the *search version* of LWE. *Distinguish LWE* is an equivalent formulation where, given $$A, e, s$$ with the same distributions as before, the goal is to distinguish $$A, s^T A + e^T$$ and $$A, r^T$$ where $$r \in \mathbb Z^m_q$$. To get an intuition, we consider the following example schemes - 

1. Public-key Encryption - 
    
    Kyber is one such scheme, motivated from this, which is now being used by Apple (as of 2024) to encrypt messages on iMessage. SABER, NTRU are other public-key encryption schemes.
    
    - $pk = A, u = s^T A + e^T$
    - $sk = s$
    - ${\sf Enc} (pk, m \in \{0, 1\}^n) :=$ choose $x \in \{0, 1\}^m$ and output $c_0 = Ax ({\sf mod} q), c_1 = \left(ux + \left[\frac{q}{2}\right].m \right)({\sf mod} q)$
    - ${\sf Dec}(sk, c_0, c_1) :=$ output
        
        $$
        \begin{align*} 
        c_1 - s^T c_0 &= \left(ux + \left[\frac{q}{2}\right].m - s^T Ax\right) {\sf mod } q \\ v &= \left(e^T x + \left[\frac{q}{2}\right].m \right) {\sf mod } q
        \end{align*} 
        $$
        
        Now, since $x \in \{0, 1\}^m$ and $e$ is ‘short’, we can bound $\|e^Tx \| < q/4$ (A loose bound). We have the following range for $v$.
        
        $$
        \begin{align*}
        0 |————|\underbrace{————|————}|————| q \\
         m = 0  \quad\quad\quad\quad m = 1  \quad\quad\quad\quad m = 0 \quad
        \end{align*}
        
        $$
        
    - **Security -** Consider the following two problems -
        - Given $pk = A, u = s^T A + e^T$, and $c_0 = Ax, c_1 = ux + \frac{q}{2} m$, find $m$.
        - Given $pk = A,  u = r^T$ and $c_0 = Ax, c_1 = ux + \frac{q}{2}m$, find $m$
        
        Now, distinguishing the above two scenarios is equivalent to solving the DLWE problem! This proves the security.
        
2. Key-Agreement Protocol - In this scenario, we want two parties $A, B$ to establish a secret key. Let us say $A, B$ have a common matrix $M \in \mathbb Z_q^{n \times n}$ they agree on.
    - To do so, $A$ samples $r \in \mathbb Z^n$ and $B$ samples $s \in \mathbb Z^n$ such that $r, s$ are short. This ensures that $r, s$ are in $Z_q^n$ as well. They also have associated error distributions $e, e’$ respectively.
    - $A$ sends $u^T = r^T M + e^T$ and $B$ sends $v = Ms + e$
    - $A$ computes $r^Tv = r^T(As + e’) \approx r^T As$
    - $B$ computes $u^T s = (rA + e^T) s \approx r^T As$
    - To avoid the small chance of error, $A, B$ choose the first $m$ bits of the obtained values. The error will most likely not affect these bits, and both parties obtain the same key.
    - For an eavesdropper, both $u^T, v$ are completely random and the security is guaranteed by LWE.

LWE has properties such begin fully homomorphic and identity-based (encrypt the message for a specific group of secret-keys). LWE can also be used for the proof of quantumness.

The bigger picture has more problems as compared to LWE. However, the theory for LWE is robust and therefore is widely used in post-quantum cryptographic protocols.

## Quantum Computers

How do we make qubits, gates and quantum computers. The first Turing complete programmable computer is the ENIAC. It was built using vacuum tubes and occupied a lot of space. After that we transitioned to transistors, and the growth has been exponential. Since 1950’s to 2010’s, we were able to progress from 1 transistor to 1-trillion transistors packed in the same area. This was correctly predicted by the Moore’s law - the number of transistors in an integrated circuit doubles roughly every two years (or eighteen months). 

In quantum computers, we are currently at the initial stage like the ENIAC - trying to figure out how to efficiently store the qubits. The following technologies are being experimented with - 

- Atoms - Trapped Ions, Cold Atoms - We prepare individual wells or *prisons* where ions are trapped electromagnetically. Two ions trapped can represent an entangled state. Lasers are used to control the properties of these ions. The qubits remain coherent for an impressive amount of time - for a few minutes. Typically, qubits are heavily influenced by the environment - the environment gets decohered easily. However, this technology is not easy to scale - the best we can do is 30 qubits. Also, applying 2-qubit gates using lasers is quite difficult.
- Superconductors - The idea is to cool certain metals to $0K$ - The materials then lose their electromagnetic properties. When two metals close together are cooled down, then they form a qubit due to *quantum tunnelling effect*. The operations are still conducted by lasers but the scalability is better. The quantum computers currently being used by Google and IBM are made from this technology. The accuracy is not high but scalability is easy (these companies use those big numbers to increase stock prices). The longevity is in the order of microseconds!
- Photons - There are some controversies with photons, with regards to using them as universal qubits. The qubits are formed using circulating in waveguides using the polarity of photons. This are difficult to scale and it is difficult to use them for ‘quantum speedup’ algorithms.
- Silicon dots - Artificial atoms made by adding an electron to silicon and these are controlled by microwaves. This is still in the experimental stage.

Currently, the accuracy for quantum gates is not as good for consumer use - the accuracy is 99.9%. IonQ based on trapped ions is currently at around ~35 qubits whereas IBM based on superconducting technology is at a 1000 qubits. However, the error per qubit in the latter case is around 2% making it infeasible to do any practical applications with these chips. Both these strides in accuracy and size are needed to reach quantum supremacy. How many years would it take to reach fault-tolerant quantum computers with a million qubits? We are not sure. The problem is not with the technology, but with the engineering - quantum computers require a lot of calibration to work with a good accuracy.

Recently, a few noisy qubits (53 in total) were able to outperform the fastest classical computers on the Poisson sampling problem. The fastest classical computers would take around 10,000 years to solve this problem!<sup>[1](#footnote1)</sup> This shows promise in the era of quantum computing. 

<a name="footnote1">1</a>: IBM showed that this result is feasible using their classical supercomputer which took 2 days to solve the problem. Even then, a few qubits solved this in minutes, so quantum supremacy is still a promising avenue.
