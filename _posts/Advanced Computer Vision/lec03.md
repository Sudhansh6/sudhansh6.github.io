### Query-Key-Value Attention

The mechanisms described previously are implemented by projecting tokens into queries, keys and values. Each of these are a vector of dimensions $p$, where $p < d$. The **query** vector for the question is used to weigh the **key** vector for each token to obtain the **values**. This is done via computing the similarity between query and each key, and then the *attention* is given by the extent of similarities, normalized with softmax. The output token is obtained by summing all value vectors with weights assigned from the previous calculations. Roughly, the process looks like -

$$
\left. 
\begin{align*}
q = W_q t \\ 
K_i = W_k t_i 
\end{align*}
\right\} \implies s_i = q^T k_i \\ 
a_i = softmax(s_i) \\
t_{out} = \sum a_i v_i
$$

The purpose of "values" is to 'project' back the similarities between queries and keys to the 'token space'. 

Also note that, if the patch-size is too large, then we might lose the information within the patches. This is a tradeoff, and the decision is made based on the task at hand. For example, classification may work with large patches but tasks such as segmentation may not.




