# Conductor audit-chain anchor

Conductor keeps an append-only, hash-chained audit log of every governed
action it takes. This file publishes that chain's head into this
repository — somewhere Conductor does not control — so that the record can
be checked by someone who does not have to take Conductor's word for it.

It is written by Conductor's broker, not by the agent that produced the
change in this push. The agent cannot omit it, and cannot write it: the
path is reserved, and a push whose payload contains it is refused.

## The anchor

```
chain head sequence      10113
chain head hash          abdb402e40274753836872b3300de8b8bca9a7c48064b4e3cb7c6d2ec4f9be0a
head row written at      2026-08-25T05:36:41.690Z
chain genesis at         2026-06-26T10:52:06.958Z
published at             2026-08-25T05:36:45.203Z
published into           Rastamasta1/test1
carried by intent        1edc1dc1-8b36-499a-9e3b-27d149b1c127
cockpit build            7c42ecf
```

## The previous anchor, so a gap is visible

```
previous head sequence   10049
previous head hash       dd235edbb8461cf356a295a8bf6b7e7b6edb5fbb27fb4dfee0fdae35e05a0a4b
previous published at    2026-08-25T05:31:01.471Z
audit rows added since   64
```

Consecutive anchors form their own chain inside this repository. If the
gap above is larger than you expect, that is the point: it is how a
period with no anchor becomes visible instead of silent. Every previous
anchor is in this file's git history — `git log .conductor/audit-anchor.md`.

## What this proves

  - Every audit row up to sequence 10113 hashes, in order, to the head
    hash above. Each row's hash covers the previous row's hash, so the
    sequence cannot be reordered, and no row can be removed from the middle
    without the following hashes disagreeing.
  - This file is committed to this repository, so the hash above existed at
    this commit's date — a date recorded in this repository's history, which
    Conductor does not administer and cannot rewrite.
  - Therefore any later edit to any audit row at or below sequence 10113
    makes Conductor's recomputed head disagree with the hash committed here,
    and the disagreement is detectable by anyone holding this file.

## What this does NOT prove

  - It says nothing about rows written BEFORE the genesis above. 2176
    rows lost their run attribution before the chain existed, and that is
    unrepairable: the identifiers are gone and nothing recorded what they were.
  - It does not prove COMPLETENESS. A chain shows that nothing recorded was
    changed. It cannot show that everything that happened was recorded.
  - It does not reveal or prove the CONTENT of any row. The hash commits to
    the whole ledger; reading any part of it still requires Conductor.
  - The sequence number counts audit rows across EVERY Conductor client, not
    only this one. It therefore discloses how many audit rows exist in total,
    and nothing about whose they are.
  - It anchors MOMENTS, NOT TIME. A head is published when Conductor's broker
    pushes to this repository, and at no other time. Between two anchors
    Conductor was running and was not anchored here. Conductor also has a
    fallback path in which its worker pushes directly, without the broker;
    such a push carries no anchor at all. Do not read the presence of this
    file on some commits as a guarantee that every commit has one.

## How to check it

  1. Note the head hash and sequence above, and this commit's date.
  2. Ask Conductor to recompute the chain over the same range. Its
     `verify_audit_chain()` walks every row in sequence order, recomputing
     each row's hash from the row's own contents and the previous hash.
  3. The head it produces for sequence 10113 must equal the hash above.
     If it does not, something at or below that sequence changed after this
     commit was made.
