#Spreadsheet language definition

This is our Backus-Naur Form (BNF) definition of the language
the spreadsheet uses to calculate values entered by the user.


```
<bop> ::= '*'
        | '/'
        | '+'
        | '-'
        | '^'

<aggop> ::= 'SUM'
          | 'PROD'
          | 'AVG'
          | 'CONCAT'

<string> ::= '"'<symbol>...'"'

<number> ::= ['-']<digit>...['.'<digit>...]

<cell> ::= <letter><letter>...<digit><digit>...

<cellrange> ::= <cell>':'<cell>

<atomic> ::= <string>
           | <number>
           | <cell>

<expr> ::= <atomic>
         | (<bop> <expr> <expr>)
         | (<aggop> <cellrange> | <expr>' '...{<expr>' '...}...<expr>)

<slang> ::= '='<expr>
          | <atomic>
```


