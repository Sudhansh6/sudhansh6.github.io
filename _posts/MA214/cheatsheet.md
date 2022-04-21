# Cheat Sheet

#### Newton Raphson 


$$
p_{i + 1} = p_i + \frac{f(p_i)}{f'(p_i)}
$$


- Bisection method, Regular Falsi, Secant method

#### Modified Newton Raphson - Choose $$f_{new}(x) = f_{old}(x)/f_{old}'(x)$$

#### Aitken’s $$\Delta^2$$ method 

For **linearly converging sequences** only!


$$
\hat p_i = p_i - \frac{(p_{i + 1} - p_i)^2}{p_{n + 2} - 2p_{n + 1} + p_n}
$$


#### $$n$$-th Taylor polynomial is


$$
P_n(x) = f(x_0) + (x - x_0)f'(x_0) + \dots + \frac {(x - x_0)^nf^{(n)}(x_0)}{n!} \\
Err(x) = \frac {(x - x_0)^{n + 1}f^{(n + 1)}(\zeta)}{n!} \text{ for } \zeta \in [a, b]
$$


#### Lagrange Interpolation

$$L_{n, i}(x_j) = \delta_{i, j}$$ and $$P(x) = \sum_i y_i L_{n, i}(x)$$.

- A polynomial of degree $$n$$ has at most $$n$$ zeros!

- Error formula for any general interpolating polynomial (value must be equal at the given points)

  
  $$
  f(x) = P_n(x) + \frac{f^{(n + 1)}(\zeta(x))}{(n + 1)!}\Pi_i (x - x_i)
  $$
  

  Notice that the $$\zeta(x)$$ changes with $$x$$.

#### Neville’s formula


$$
P(x) = \frac{(x - x_j)(Q_j(x)) - (x - x_i)(Q_i(x))}{x_i - x_j}
$$


#### Divided Differences


$$
f[x_0, \dots, x_n] = \frac{f[x_1, \dots, x_n] - f[x_0, \dots, x_{n - 1}]}{x_n - x_0}
$$

$$
P_n(x) = P_{n - 1}(x) + f[x_0, \dots, x_n](x - x_0)(x - x_1)\dots (x - x_{n - 1})
$$



![](/Users/sudhansh/Desktop/Projects/new_website/_posts/MA214/assets/image-20220127150002932.png)

Nested polynomial reduces the error.

Also, 


$$
f[x_0, \dots, x_n] = \frac{f^{(n)}(\zeta)}{n!} 
$$


#### Osculating Polynomials


$$
\frac{d^k}{dx^k} f(x_i) = \frac{d^k}{dx^k} P(x_i)
$$


for $$k \in \{1, \dots, m_i\}$$ and $$i \in \{0, \dots, n\}$$.

#### Hermite Polynomials


$$
H_i(x) = [1 - 2(x - x_i)L'_i(x_i)]L^2_i(x) \\
\hat H_i(x) = (x - x_i)L^2_i(x) \\
P_{2n - 1}(x) = \sum_i H_i(x)f(x_i) + \sum_i \hat H_i(x)f'(x_i)
$$


Error as expected is 


$$
err(x) = \frac{(x - x_0)^2 \dots (x - x_n)^2}{(2n + 2)!}f^{(2n + 2)}(\zeta(x))
$$


Can use divided differences as the polynomial is unique!

#### Splines

Natural boundary $$f'(x_0) = P'(x_0),  f'(x_n) = P'(x_n)$$ and clamped boundary $$f'(x_0) = f'(x_n) = 0$$. The following for cubic spline!

![image-20220421215701164](/Users/sudhansh/Library/Application Support/typora-user-images/image-20220421215701164.png)

Error for **clamped** spline - Let $$f$$ be 4 times continuously differentiable and $$M = \max_{a, b}f^{(4)}(x)$$. Then error is


$$
Err(x) = \frac{5M}{2^4 4!}\max_j (x_{j + 1} - x_j)^4
$$


### Differentiation Approximation

![image-20220421220149181](/Users/sudhansh/Library/Application Support/typora-user-images/image-20220421220149181.png)

![image-20220421220211615](/Users/sudhansh/Library/Application Support/typora-user-images/image-20220421220211615.png)

Remember that $$x_i = h + x_{i - 1}$$. To get the error formula, substitute $$\tilde f = f + \epsilon$$.

#### Trapezoidal Rule


$$
\int_a^b f(x)dx = \frac{h}{2}(f(x_0) + f(x_1)) - \frac{h^3}{12}f''(\zeta)
$$


#### Simpson’s Rule


$$
\begin{align}
\int_a^b f(x)dx &= \sum_{j = 1}^{n/2} \left\{\frac{h}{3}[f(x_{2j - 2} + 4f(x_{2j - 1} + f(x_{2j}] - \frac{h^5}{90}f^{(4)}(\xi_j)\right\} \\
&= \frac{h}{3}\left[f(a) + 2\sum_{j = 1}^{n/2 - 1}f(x_{2j}) + 4\sum_{j = 1}^{n/2}f(x_{2j - 1}) + f(b)\right] - \frac{b - a}{180}h^4f^{(4)}(\mu)
\end{align}
$$


Error in composite trapezoidal rule is $$\frac{b - a}{12}h^2f''(\mu)$$, and in composite Simpson’s rule is $$\frac{b - a}{180}h^4f''(\mu)$$.

Round-off error in composite Simpson’s bounded by $$(b - a)\epsilon$$.

#### Newton Cotes

Add formulae



#### Adaptive Quadrature formulae

When you divide an interval by half, the Simpson (normal, not composite) estimate becomes more accurate by a factor of 15. So divide until you get the required upper bound on the error.

#### Gaussian Quadrature

Gives weights to points for a better estimate. 


$$
\int_a^b f(x) dx = \sum_i c_i f(x_i)
$$


We have $$2n$$ parameters to evaluate. Therefore, all polynomials with degree $$< 2n $$ should satisfy. $$x_i$$ are roots of the $$n$$th Legendre polynomial, and 


$$
c = \int_{-1}^1\Pi_{j = 1, j \neq i}^n \frac{x - x_j}{x_i - x_j}dx
$$


Instead of this, calculate manually using $$x^i$$ polynomials for $$i \in \{0, \dots, 2n - 1\}$$.

#### Multidimensional integral

![image-20220421222636533](assets/image-20220421222636533.png)

For Simpson’s. Similarly, you can do for Trapezoidal.



