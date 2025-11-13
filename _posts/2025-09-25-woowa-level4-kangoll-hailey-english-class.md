---
layout: post
title: "[우테코] level-4 / kangoll & hailey's English class"
author: kangoll
categories: [woowaCourse, tech-reflection]
image: assets/images/thumbnail/woowa-level4-kangoll-hailey-english-class.png
---

> 요약 <br/>
> 헤일리와 함께하는 10분 영어 클래스 내용을 정리했습니다. <br/>
> 각자 발표하고 싶은 주제를 찾아와서 약 10분간 영어로 설명해줍니다.<br/>
> 모르는 내용이 있거나 궁금한 내용이 있다면 영어로 대화합니다 💬

<br/>

---

### 목차

- [0925 - **http VS https**](#0925---http-vs-https)
  - [✅ What is HTTP](#-what-is-http)
  - [✅ What is HTTPS](#-what-is-https)
    - [SSL/TLS’s Role](#ssltlss-role)
  - [✅ conclusion](#-conclusion)
- [1001 - **cookies, sessions, tokens**](#1001---cookies-sessions-tokens)
  - [✅ Cookie](#-cookie)
  - [✅ Sessions](#-sessions)
  - [✅ Token](#-token)
    - [JWT (JSON Web Token)](#jwt-json-web-token)
- [1015 - **Browser Storage**](#1015---browser-storage)
  - [✅ Cookies](#-cookies)
  - [✅ Local Storage](#-local-storage)
  - [✅ Session Storage](#-session-storage)
  - [✅ IndexedDB \& Cache Storage](#-indexeddb--cache-storage)
- [1015 - **Symmetric key ciphers and asymmetric key ciphers**](#1015---symmetric-key-ciphers-and-asymmetric-key-ciphers)
  - [✅ Introduction - Why We Need Encryption](#-introduction---why-we-need-encryption)
  - [✅ Symmetric Encryption](#-symmetric-encryption)
  - [✅ Asymmetric Encryption](#-asymmetric-encryption)

<br/>

## 0925 - **http VS https**

---

> **Summery** <br/>
> http & https : protocol - the way the web browser and server communicate

<br/>

### ✅ What is HTTP

---

- standard protocol for exchanging information on the web
- structure : ( broser(request) → server(response)) : Html, image, data…
- problem : Unencrypted and sent to Plain Text

> <p style="color: darkseagreen;">Unencrypted : 암호화 되지 않음</p>

<br/>

### ✅ What is HTTPS

---

- Http + security(-S) Certificate (SSL/TLS)
  - https is a protocol with a security certificate added to http.
- protect http communications with SSL/TLS encryption
- Gain data integrity : data is not tampered with in the middle
- so, Even if the communication is intercepted, the content is unknown > only encrypted data is visible

##### SSL/TLS’s Role

SSL : Secure Sockets Layer <br/>
TLS : Transport Layer Security (standard)

- Encryption : no one else can see the content
- Authentication : Proof that the server is real
- Integrity : Ensure data is not tampered with

> <div style="color: darkseagreen;">Certificate : 인증서  &nbsp; / &nbsp; encryption : 암호화 &nbsp; / &nbsp; gain : 얻다</div>
> <div style="color: darkseagreen;">integrity : 청렴 , 무결성셔 (not loss : 손실 X)  &nbsp; / &nbsp; tampered : 참견하다</div>
> <div style="color: darkseagreen;">Even if : ~ 하게 되더라도 &nbsp; / &nbsp; intercepted : 가로채다 &nbsp; / &nbsp; encrypted : 암호화된 </div>

<br/>

### ✅ conclusion

---

- HTTP has announced the start of the web, but there are too many security problems
- In the future, HTTPS will be used instead of HTTP, and the web without security will gradually disappear

> <div style="color: darkseagreen;">integral : 없어서는 안 될 &nbsp; / &nbsp; gradually : 점진적으로</div>

🔝 [목차](#목차)로 돌아가기

<br>
<br>

## 1001 - **cookies, sessions, tokens**

---

typical ways a server authenticates a client

> <div style="color: darkseagreen;">typical : 대표적인</div>

<br/>

### ✅ Cookie

---

- string information in the form of key-value, stored in the client browser
- method of - identifying users, by sending cookies together on request

**advantages** <br/>
simple way to implement

**disadvantages**<br/>
be weak in security & Capacity limits exist <br/>
cookie size increases → Network load occurs

> <div style="color: darkseagreen;">identifying : 식별하다 &nbsp; / &nbsp; implement : 도구, 수단</div>

<br/>

### ✅ Sessions

---

Manage sensitive information on the server side <br/>
Store session ID only in cookie form on client

**advantages** <br/>
Safer management than cookies

**disadvantages** <br/>
Risk of session ID hijacking <br/>
Requires session storage on the server

> <div style="color: darkseagreen;"> manage : 관리하다 (계획, 통제의 느낌) &nbsp; / &nbsp; handle (유사어) : 어떤 문제를 직접 처리하다. (즉각적인 상황)</div>
> <div style="color: darkseagreen;"> hijacking : 납치하다, 강탈하다</div>

<br/>

### ✅ Token

---

- once the client is authenticated to the server, the server issues a Token (informed value)
- client presents this token **on each request** to prove authentication

**advantages** <br/>
stateless characteristic : it does not maintain the state<br/>
Minimize DB inquiry

**disadvantages** <br/>
Payload is simple encoding and cannot store sensitive information <br/>
Difficult to deal with token takeover

> <div style="color: darkseagreen;"> issues : 발급하다, 발행하다  &nbsp; / &nbsp; informed : 정보를 제공하다</div>
> <div style="color: darkseagreen;"> stateless : 무상태 - 과거의 기록을 기억하지 않고 그때그때 정보만 바로 처리한다.</div>
> <div style="color: darkseagreen;"> inquiry : 조회  &nbsp; / &nbsp; sensitive : 민감한 ; deal : 대처하다  &nbsp; / &nbsp takeover : 탈취</div>

##### JWT (JSON Web Token)

JSON-based token with authentication information

- structrue: `Header.Payload.Signature`
  - Header: Define which algorithm to sign
  - Payload: Information Required for Authentication
  - `Signature` : combines Header and Payload with SecretKey

**advantages**<br/>
can block forgery through Signature verification<br/>

> <div style="color: darkseagreen;">forgery : 위조 / 도용</div>

🔝 [목차](#목차)로 돌아가기

<br/><br/>

## 1015 - **Browser Storage**

---

Last time, we talked about cookies, sessions, and tokens (**that manage status/authentication with servers.)** <br/>
In this session, we will present about browser storage. <br/>
Browser storage is a method of storing directly in a client (browser).

> <div style="color: darkseagreen;"> storing : 저장 (n)  &nbsp; / &nbsp;  directly : 직접적으로(n)</div>

<br/>

### ✅ Cookies

---

Oldest method used by server/client together

- Capacity: ~4KB
- Mainly used for session maintenance, ad tracking
- But, Security issues (XSS, CSRF)

  - **XSS : (Cross-site script)** : vulnerability where an attacker's embedded script runs in a user's browser.
  - **CSRF : (Content Security Policy)** : attack that exploits the authentication of a logged-in user (to execute an unwanted state change request.)

> <div style="color: darkseagreen;"> Oldest : 가장 오래된 &nbsp; / &nbsp; Mainly : 주로 &nbsp; / &nbsp; Vulnerability : 취약</div>
> <div style="color: darkseagreen;"> embedded : 끼워 넣어지다 &nbsp; / &nbsp; exploits : 이용하다</div>

<br/>

### ✅ Local Storage

---

- Domain units, persistent storage (remains if not cleared)
- Capacity: 5-10 MB
- can only store string
  - ex) Set dark mode, maintain language selection

> <div style="color: darkseagreen;"> persistent : 영구적인 &nbsp; / &nbsp; exploits : 이용하다 &nbsp; / &nbsp; abstract : 추상적인 </div>

<br/>

### ✅ Session Storage

---

- Similar to Local Storage, but per tab
- Disappear when tab is closer
  - If you close the tab during payment, it will fly

<br/>

### ✅ IndexedDB & Cache Storage

---

**IndexedDB**

- Large Data Storage (Hundreds of MB or more)
- Structured data, transaction support
- Asynchronous Processing
  - Gmail Offline Mode

**Cache Storage**

- Save network request/response objects
- Can provide resources offline

🔝 [목차](#목차)로 돌아가기

<br/>

## 1015 - **Symmetric key ciphers and asymmetric key ciphers**

---

### ✅ Introduction - Why We Need Encryption

---

**Encryption** is one of the most essential technologies to protect our data
<br>
when we send information over the internet - like passwords, messages - it passes through many servers and networks. <br/>
Without encryption, anyone could intercept and read that data.<br/>
To avoid this risk, data is encrypted and transmitted.

In modern networks, there are two main types of encryption: <br/>
**symmetric and asymmetric.**

> <div style="color: darkseagreen;"> over : ~를 통해서 &nbsp; / &nbsp; pass (through) : 통과하다,지나가다 </div>

<Br/>

### ✅ Symmetric Encryption

---

The same key is used for both encryption and decryption.<br/>
In symmetric encryption, the sender and receiver share one secret key.<br/>
The sender uses this key to encrypt the data, and the receiver uses the same key to decrypt it.<br/>
Therefore, the sender and receiver must share the same key in advance

**feature**

Because it uses only one key, symmetric encryption is fast and efficient, But key transfer is difficult<br/>
If the key is leaked, all the data becomes dangerous.

> <div style="color: darkseagreen;"> used for both + N : 둘 다에 사용되다 &nbsp; / &nbsp; in advance : 사전에 &nbsp; / &nbsp; leaked : 유출되다</div>

<br/>

### ✅ Asymmetric Encryption

---

Uses a pair of keys — a public key and a private key. <br/>

- The public key can be shared with anyone

> <div style="color: darkseagreen;"> used for both + N : 둘 다에 사용되다 &nbsp; / &nbsp; </div>
