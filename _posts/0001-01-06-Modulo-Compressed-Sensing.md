---
layout: post
title: Modulo Compressed Sensing
categories: [Research]
excerpt: An introduction to recovery methods for measurements using fixed dynamic range sensors.
---

<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML" async></script>

## Compressed Sensing

Recover a high dimensional vector $$x$$ with a very few non-zero values. 
 - $$\operatorname{Supp(x)} \leq k << N$$.
 - Plethora of algorithms

### Sensors and Measurements
 - Sensors have Finite Dynamic Range 

 - $$ \text{dynamic range} = 20\log\left(\frac{\text{ADC range}}{\text{Step size}}\right) = 20\log\left(\frac{2\lambda}{ \delta}\right) $$ 
 - Loss of information due to clipping. One potential approach to fix this is to wrap around the signal.

   ![image-20210610112718042](/images/0001-01-01-Modulo-Compressed-Sensing/image-20210610112718042.png)​

This is where Modulo comes in. 

### Why can't we scale the signal?

There is an inherent quantization step involved during measurements. Therefore, scaling down and scaling back up will have the same resolution. 

- Quantization error is proportional to the maximum value of the input signal.

# Modulo Compressed Sensing

Typically, the real world sensors have a **finite** dynamic range. They have a **clipping** effect where the measurements become **saturated** once the values cross the range of the sensor. High dynamic range systems are affected by *high quantization noise*. To counter this problem, a new approach for measurements called **self-reset analog to deigital converters (SR-ADCs)** have been proposed.

These sensors fold the amplitudes back into the dynamic range of the ADCs using the modulo arithmetic. However, these systems encounter loss due to the modulo operation. The *transfer* function of the SR_ADC with parameter $$\lambda$$ is given by  
<div style="text-align: center;">
$$
\mathcal M_\lambda = 2\lambda \left( \left[ \left[ \frac{t}{2\lambda} + \frac{1}{2} \right]\right] - \frac{1}{2}\right)
$$  
</div>

Here, $$[[t]] \triangleq t = \lfloor t \rfloor $$. Now, we need to consider how we shall sample the values. A sampling theory called *unlimited sampling framework* was developed which provides sufficient conditions on the sampling rate for guaranteeing the recovery of band-limited signals from the folded samples. SR-ADC is applied individually to multiple linear measurements of the images, and is termed as modulo compressed sensing.

**Note.** The measured values may lie *outside* the dynamic range due to **sensor noise**. 

Let us concretely define the problem. Let $$x \in \mathbb{R}^N$$ denote an $$s$$-sparse vector ($$||x||_0 \leq s$$) with $$s < \frac{N}{2}$$. We obtain $$m$$ *projections* of $$x$$ as follows:
<div style="text-align: center;">
$$
z_i = [[ \langle a_i, x \rangle ]], i = 1,2, \cdots, m
$$
</div>
Usually, $$m \leq N$$ in the compressed sensing paradigm. Stacking these projections, we get
<div style="text-align: center;">
$$
z = [[y]] = [[Ax]]
$$
</div>
The non-linearity introduced by the modulo operation along with the undetermined compressive measurements could lead to an indeterminate system.


> $$P_0$$: Any real valued vector $$y \in \mathbb{R}^m$$ can be uniquely decomposed as $$y = z + v$$ where $$z \in [0, 1)^m$$ and $$v \in \mathbb{Z}^m$$ denote the fractional and integral part of $$y$$ respectively. The following optimization problem is defined as $$P_0$$ 
>
> <div style="text-align: center;">
$$
\arg \min_{w,v} \|w\|_o \text{ subject to } Aw = z + v; v \in \mathbb Z^m
$$
> </div>
> - Notice that $$v$$ is the integral part and not $$z$$, which may be confusing.
> - The optimization equation does not oblige $$z$$ to belong to $$[0, 1)^m$$. Infact, this condition is implicitly taken care when we impose minimality over $$z$$.
> - The $$\|w_0\|$$ condition comes due to the sparsity of $$w$$.
> - Any $$s'$$ sparse solution to $$P_0$$ s.t. $$s' \leq s$$ is also $$s$$ sparse.

## Identifiability

> Lemma: Any vector $$x$$ satisfying $$\|x\|_0 \leq s < \frac{N}{2}$$ is a unique solution to the optimization problem $$P_0$$ iff any $$2s$$ columns of matrix $$A$$ are linearly independent of all $$v \in \mathbb Z^m$$ 

The proof of the above lemma is trivial and is left to the reader.

> Corollary: Any vector $$x$$ satisfying $$\|x\|_0 \geq \frac{N}{2}$$ is a unique solutions to $$P_0$$ iff columns of $$A$$ are linearly independent. Consequently, the minimum number of measurements required for unique recovery is <span style="color:red">  m = N + 1​  </span>

