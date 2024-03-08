---
layout: post
title: Modulo Compressed Sensing
categories: [Research]
description: An introduction to recovery methods for measurements using fixed dynamic range sensors.
---

## Compressed Sensing

Recover a high dimensional vector $$x$$ with a very few non-zero values. Plethora of algorithms
### Sensors and Measurements
 - Sensors have Finite Dynamic Range 

 - Loss of information due to clipping. One potential approach to fix this is to wrap around the signal.

   ![image-20210610112718042](/assets/img/0001-01-01-Modulo-Compressed-Sensing/image-20210610112718042.png)​

This is where Modulo comes in. 

### Why can't we scale the signal?

There is an inherent quantization step involved during measurements. Therefore, scaling down and scaling back up will have the same resolution. 

- Quantization error is proportional to the maximum value of the input signal.

# Modulo Compressed Sensing

Typically, the real world sensors have a **finite** dynamic range. They have a **clipping** effect where the measurements become **saturated** once the values cross the range of the sensor. High dynamic range systems are affected by *high quantization noise*. To counter this problem, a new approach for measurements called **self-reset analog to digital converters (SR-ADCs)** have been proposed.

These sensors fold the amplitudes back into the dynamic range of the ADCs using the modulo arithmetic. However, these systems encounter loss due to the modulo operation. The *transfer* function of the SR_ADC with parameter $$\lambda$$ is given by  
<div style="text-align: center;">


$$
\mathcal M_\lambda = 2\lambda \left( \left[ \left[ \frac{t}{2\lambda} + \frac{1}{2} \right]\right] - \frac{1}{2}\right)
$$

</div>Here, $$[[t]] \triangleq t = \lfloor t \rfloor $$. Now, we need to consider how we shall sample the values. A sampling theory called *unlimited sampling framework* was developed which provides sufficient conditions on the sampling rate for guaranteeing the recovery of band-limited signals from the folded samples. SR-ADC is applied individually to multiple linear measurements of the images, and is termed as modulo compressed sensing.

**Note.** The measured values may lie *outside* the dynamic range due to **sensor noise**. 

Let us concretely define the problem. Let $$x \in \mathbb{R}^N$$ denote an $$s$$-sparse vector ($$||x||_0 \leq s$$) with $$s < \frac{N}{2}$$. We obtain $$m$$ *projections* of $$x$$ as follows:
<div style="text-align: center;">

$$
z_i = [[ \langle a_i, x \rangle ]], i = 1,2, \cdots, m
$$

</div>Usually, $$m \leq N$$ in the compressed sensing paradigm. Stacking these projections, we get

<div style="text-align: center;">

$$
z = [[y]] = [[Ax]]
$$

</div>The non-linearity introduced by the modulo operation along with the undetermined compressive measurements could lead to an indeterminate system.


> $$\mathbf{P_0}$$: Any real valued vector $$y \in \mathbb{R}^m$$ can be uniquely decomposed as $$y = z + v$$ where $$z \in [0, 1)^m$$ and $$v \in \mathbb{Z}^m$$ denote the fractional and integral part of $$y$$ respectively. The following optimization problem is defined as $$P_0$$ 

<div style="text-align: center;">

$$
\arg \min_{x,v} \|x\|_0 \\ \text{ subject to } Ax = z + v; v \in \mathbb Z^m
$$

</div>


> - Notice that $$v$$ is the integral part and not $$z$$, which may be confusing.
> - The optimization equation does not oblige $$z$$ to belong to $$[0, 1)^m$$. In fact, this condition is implicitly taken care when we impose minimality over $$z$$.
> - The $$\|w_0\|$$ condition comes due to the sparsity of $$w$$.
> - Any $$s'$$ sparse solution to $$P_0$$ such that $$s' \leq s$$ is also $$s$$ sparse.

## Identifiability

>  **Lemma.** Any vector $$x$$ satisfying $$\|x\|_0 \leq s < \frac{N}{2}$$ is a unique solution to the optimization problem $$P_0$$ iff any $$2s$$ columns of matrix $$A$$ are linearly independent of all $$v \in \mathbb Z^m$$ 

---

**Proof.**

($$\rightarrow$$)	Suppose a set of $$2s$$ columns of $$A$$, say $$S$$, are not linearly independent. That is, 

<div align = center>

$$
Ay = w \in \mathbb{Z}^m \text{ where } y\in \mathbb{R}^n \text{ has support } S
$$

</div>Consider a vector $$x$$ defined from $$y$$ whose support is the first $$s$$ columns of $$S$$. Similarly, define $$x_1$$ whose support is the remaining $$s$$ columns of $$S$$. Let $$Ax = z + v$$ where $$z \in (0, 1)^m$$ and $$ v \in \mathbb{Z}^m$$. We have 

<div align = center> 

$$
Ax_1 = Ay - Ax = w - (z + v)
$$

</div> Therefore, $$-x_1$$ and $$x$$ are both solutions of $$P_0$$. This is a contradiction. This proves sufficiency.

($$\leftarrow$$)	Let $$z \in (0, 1)^m$$ and $$ v, v_1 \in \mathbb{Z}^m$$ such that $$Ax = z + v$$  and $$ Ax_1 = z + v_1$$ where $$\|x\|_0, \|x_1\|_0 \leq s$$. Now, the size of the support of $$x - x_1$$ is at most $$2s$$. Consequently, 

<div align = center>

$$
A(x - x_1) = v - v_1 \in \mathbb{Z}^m
$$

</div>This is a contradiction as any $$2s$$ columns of $$A$$ are linearly independent of all $$v \in \mathbb{Z}^m$$. This proves necessity.   

---

>  ***Corollary.*** Any vector $$x$$ satisfying $$\|x\|_0 \geq \frac{N}{2}$$ is a unique solutions to $$P_0$$ iff columns of $$A$$ are linearly independent. Consequently, the minimum number of measurements required for unique recovery is m = $$N + 1$$ (not $$N$$, see below)

## Conditions for recovery

### Signals in spacial domain

To compare the modulo-CS problem to the standard CS problem, we state the two necessary conditions for modulo-CS recovery.

The following two conditions are necessary for recovering any vector $$x$$ satisfying $$\|x\|_0 \leq s$$ as a unique solution to $$P_0$$:

-  $$m \geq 2s + 1$$, and
- Any $$2s$$ columns of $$A$$ are linearly independent.

$$m = 2s$$ is necessary and sufficient for unique sparse recovery in the standard CS setup. We now show $$m = 2s + 1$$ measurements is sufficient for unique recovery. 

>  **Theorem.** For any $$N \geq 2s + 1$$, there exists a matrix $$A \in \mathbb{R}^{m \times N}$$ with $$m = 2s + 1$$ rows such that every $$s$$-sparse $$x \in \mathbb{R}^N$$ can be uniquely recovered from its modulo measurements $$z = [[Ax]]$$

---

**Proof.** We define the following

1. $$\mathcal{V} = \{v \vert v \in \mathbb{Z}^m\}$$ denotes the *countably* infinite set of all integer vectors.
2. $$\mathcal{G} = \{T \vert T \subset [N], \vert T\vert = 2s\}$$ denotes the set of all index sets on $$[N]$$ whose cardinality is $$2s$$.

Let $$A$$ be a matrix for which at least one $$s$$- sparse vector $$x$$ **cannot** be recovered from $$z = [[Ax]]$$ via $$(P_0)$$. Our aim is to show the set of all such matrices is of [**Lebesgue measure zero**](#appendix1).

For a given $$u \in \mathcal{V}$$ and $$S \in \mathcal{G}$$, construct $$B(u, S) = \begin{bmatrix}u&A_S\end{bmatrix}$$. If $$det(B(u, S))$$ equals $$0$$, then $$A$$ is not linearly independent of $$\mathbb{Z}^m$$. This function is a non-zero polynomial of the entries of $$A_s$$, and therefore the set of matrices which satisfy this condition have Lebesgue measure zero. 

Now, consider $$\cup_{S \in \mathcal{G}}\cup_{u \in \mathcal{V}} \{ A \vert det(B(u, S)) = 0 \}$$, This set is of Lebesgue measure zero (why?). Therefore, any matrix $$A$$ chosen outside this set will ensure that any $$s$$-sparse vector $$x$$ can be recovered from $$y = [[Ax]]$$.

---

- If the entries of $$A$$ are drawn independently from any continuous distribution, $$A$$ lies outside the set of Lebesgue measure 0 described in the above theorem.
- Integer matrices cannot be used as candidate measurement matrices for modulo CS (why?)

### Signals in Temporal domain

**Unlimited Sampling Theorem**  -  A band-limited signal can be recovered from modulo samples provided that a certain sampling density criterion is satisfied. This criterion must be independent of the ADC threshold. 

> **Theorem.** Let $$f(t)$$ be a function with no frequencies higher than $$\Omega$$(rad/s), then a sufficient condition for recovery of $$f(t)$$ from its modulo samples $$y_k = \mathcal M_\lambda(f(t)), t = kT, k \in \mathbb Z$$ is,
>
> <div align = center>
>
> $$
> T \leq \frac{1}{2\Omega e}
> $$
>
> </div>

The above guarantees the recovery of the signal. Now, we discuss the conditions for unique recovery. There is a one-to-one mapping between a band-limited function and its modulo samples provided that the sampling rate is higher than the *Nyquist Rate*, $$T < \pi/\Omega$$.

> **Theorem.** Let $$f(t)$$ be a finite-energy function with no frequencies higher than $$\Omega$$ (rad/s). Then the function $$f(t)$$ is *uniquely* determined by its modulo samples $$y_k  = \mathcal M_\lambda(f(t_k))$$ taken on grid $$t = kT_\epsilon, k \in \mathbb Z$$ where 
>
> <div align = center>
>
> $$
> 0 < T_\epsilon < \frac{\pi}{\Omega + \epsilon}, \epsilon > 0
> $$
>
> </div>

## Convex Relaxation

Replacing the $$l_0$$-norm in $$P_0$$ with the $$l_1$$-norm, we obtain the optimization problem:

<div align = center>

$$
\mathbf{P_1} :\arg \min_{x, v} \|x\|_1 \\ \text{ subject to } Ax = z + v; v \in \mathbb{Z}^m
$$

</div>

### Integer Range Space Property

A matrix $$A$$ is said to satisfy the *IRSP* of *order* $$s$$ if, for all sets $$S \subset [N]$$ with $$\vert S\vert \leq s$$,

<div align = center>

$$
\|u_S\|_1 < \|u_{S^c}\|_1
$$

</div>

holds for every $$u \in \mathbb{R}^N$$ with $$Au = v \in  \mathbb{Z}^m$$.

> **Theorem.** Every $$s$$-sparse $$x$$ is the unique solution of $$(P_1)$$ iff the matrix $$A$$ satisfies the IRSP of order s.

---

**Proof.** 

($$\rightarrow$$)	Consider a fixed index set $$S$$ with $$\vert S\vert \leq s$$, and suppose that every $$x$$ supported on $$S$$ is a unique minimizer of $$(P_1)$$. Then, for any $$u$$ such that $$Au = v \in \mathbb Z^m$$, the vector $$u_S$$ is the unique minimizer of $$(P_1)$$. But, $$A(u_S + u_{S^c}) \in \mathbb Z^m$$. This means that $$u_{S^c}$$ is also a solution of $$(P_1)$$ for $$[[Au_S]] = y$$. Consequently, (we are talking about $$l_1$$-norm not $$l_0$$-norm)

<div align = center> 

$$
\|u_S\|_1 < \|u_{S^c}\|_1
$$

 </div> 

($$\leftarrow$$)	Suppose IRSP holds with respect to the set $$S$$. Consider $$x$$ supported on $$S$$ and another vector $$x^1$$ that result in the same modulo measurements with respect to $$A$$. Let $$u = x - x^1$$, the vector $$Au \in \mathbb Z^m$$. Due to the IRSP, 

<div align = center>

$$
\|u_S\|_1 < \|u_{S^c}\|_1
$$

</div>

Hence, 

<div align = center>

$$
\begin{align} \|x\|_1 &\leq \|x - x^1_S\|_1 + \|x^1_S\|_1 \\ &= \|u_S\|_1 + \|x^1_S\|_1 \\ &< \|u_{S^c}\|_1 + \|x^1_S\|_1 \\ &= \|-x^1_{S^c}\|_1 + \|x_S^1\|_1 = \|x^1\|_1\end{align}
$$

</div>Thus proving uniqueness.

---

## Mixed Linear Integer Program (MILP)

The $$l_1$$-norm can be re-written as a linear function using two positive vectors $$x^+$$ and $$x^-$$, where $$x = x^+ - x^-$$. This leads to the MILP formulation

<div align = center>

$$
\min_{x^+, x^-, v} \mathbf{1}^T(x^+ + x^-) \\
\text{ subject to } \\ \begin{bmatrix}A&-A&-I\end{bmatrix}\begin{bmatrix}x^+ \\ x^- \\ v\end{bmatrix} = z; \\ v\in \mathbb Z^m; x^+, x^- \geq 0
$$

</div> This is efficiently solved using [branch-and-bound algorithm](https://towardsdatascience.com/the-branch-and-bound-algorithm-a7ae4d227a69).

#### <a name = appendix1>Appendix - Lebesgue Measure</a>

Lebesgue measure is an extension of the classical notions of length, area and volume to more complicated sets. Given an open set $$S \equiv \sum_k (a_k, b_k)$$ containing disjoint intervals, the Lebesgue measure is defined by 

<div align = center>

$$
\mu_L(S) = \sum_k(b_k - a_k)
$$

</div> Refer to this [document](https://math.unl.edu/~gmeisters1/papers/Measure/measure.pdf) for more details regarding this topic.

Let $$A \subseteq \mathbb{R}$$. $$A$$ is said to be of **measure zero** if for any $$\epsilon > 0$$, there exists a sequence of open intervals $$(I_n)_{n \in \mathbb{N}}$$  such that, 

<div align = center> 

$$
A \subseteq \bigcup\limits^\infty_{n = 1}I_n \text{ and } \sum_{n = 1}^\infty l(I_n) < \epsilon
$$

</div>where,  $$l((a, b)) = b - a$$. For example, $$\mathbb{Q}$$ is of measure zero.

