---
title: "Authenticité et sécurité"
description: "Empreintes du certificat TLS de erickilama.com et procédures de vérification indépendante."
bodyClass: "page-trust"
aliases:
  - /security/
  - /verify/
  - /verification/
  - /securite/
---

## Pourquoi cette page

erickilama.com publie de l'analyse stratégique destinée à des décideurs institutionnels. Toute personne souhaitant s'assurer qu'elle consulte bien le site authentique — et non une page intercalée par un filtre réseau, un proxy d'entreprise, un VPN, un contrôle parental ou un contenu frauduleux — peut vérifier ici l'empreinte cryptographique du certificat servi par l'infrastructure officielle.

Cette vérification est indépendante du navigateur et de l'appareil utilisés.

## Empreinte du certificat officiel

| Champ | Valeur |
|---|---|
| Nom commun | `erickilama.com` |
| Noms alternatifs | `erickilama.com`, `www.erickilama.com` |
| Autorité émettrice | C=US, O=Let's Encrypt, CN=R13 |
| Racine de confiance | ISRG Root X1 (Internet Security Research Group) |
| Valide du | Apr  3 04:45:32 2026 GMT |
| Valide jusqu'au | Jul  2 04:45:31 2026 GMT |
| Numéro de série | `061D58388DDA11E6DE1D58FD9979A5DB156A` |
| Empreinte SHA-256 | `E4:D4:6D:AA:AF:0C:DA:49:C0:8C:57:6D:5D:11:71:5D:BD:0E:3D:D8:D5:80:17:15:4F:E0:BD:0C:8E:80:D6:64` |
| Empreinte SHA-1 | `7C:4B:36:DB:FD:10:72:D6:9A:90:6E:A4:D2:A4:DB:8D:67:63:3D:97` |
| Pin SPKI (SHA-256, base64) | `DQc7m3O0sO4W4/WA5SHHtseqIKSKdkp1jhsx3/UEPZA=` |

**Généré automatiquement le** : 2026-04-16 04:06 UTC

Le certificat est renouvelé par l'infrastructure GitHub Pages tous les 60 à 90 jours ; les empreintes changent à chaque renouvellement. Pour une vérification en temps réel et indépendante, consultez les journaux publics de Certificate Transparency :

- [crt.sh — tous les certificats émis pour erickilama.com](https://crt.sh/?q=erickilama.com)
- [Google Certificate Transparency](https://transparencyreport.google.com/https/certificates?domain=erickilama.com)

Ces journaux sont tenus par des tiers et ne peuvent pas être falsifiés par l'éditeur du site ni par un intermédiaire réseau.

## Vérification manuelle

### En ligne de commande (macOS, Linux, WSL)

```bash
echo | openssl s_client -servername erickilama.com -connect erickilama.com:443 2>/dev/null \
  | openssl x509 -noout -fingerprint -sha256
```

Le résultat doit correspondre exactement à l'empreinte SHA-256 ci-dessus. S'il diffère, la connexion est interceptée quelque part entre votre appareil et le serveur.

### Dans un navigateur

1. Ouvrir [https://erickilama.com/](https://erickilama.com/)
2. Cliquer sur l'icône de cadenas dans la barre d'adresse
3. Afficher les détails du certificat
4. L'émetteur doit indiquer **Let's Encrypt**, la chaîne de confiance doit remonter à **ISRG Root X1**

## Si votre navigateur affiche un avertissement de sécurité

Un message du type « Cette connexion n'est pas privée », « Le certificat n'est pas valide » ou « Le site tente de se faire passer pour erickilama.com » ne signifie **pas** que erickilama.com est un site frauduleux. Dans la grande majorité des cas, l'origine de l'avertissement est côté votre appareil ou votre réseau.

### Causes fréquentes

1. **Profil d'entreprise ou pare-feu nouvelle génération** qui inspecte le trafic HTTPS (solutions MDM, filtres Web, passerelles de sécurité). Ces outils installent leur propre autorité de certification sur votre appareil et remplacent les certificats à la volée. L'émetteur affiché n'est alors pas *Let's Encrypt* mais le nom de votre entreprise ou d'un éditeur comme *Zscaler*, *Netskope*, *Cisco Umbrella*, *Bluecoat*, *Fortinet*.
2. **Contrôle parental ou filtre familial** sur iOS, Android ou routeur domestique.
3. **Horloge système déréglée**. Un certificat apparaît invalide si la date de votre appareil est décalée. Activez le réglage automatique de la date et de l'heure.
4. **Système d'exploitation très ancien** qui ne contient pas la racine *ISRG Root X1* dans son magasin de confiance — iOS antérieur à 14, Android antérieur à 7.1, Windows non mis à jour depuis 2017, macOS antérieur à 10.12.1.
5. **Wi-Fi d'entreprise ou d'hôtel** qui procède à une inspection TLS sans que l'utilisateur en soit informé.

### Procédure recommandée si vous voyez un avertissement

1. Dans le message d'avertissement, ouvrir **« Afficher les détails »** et noter le nom de l'émetteur affiché.
2. Comparer avec l'empreinte SHA-256 de la table ci-dessus.
3. Si l'émetteur n'est pas *Let's Encrypt* ou si l'empreinte diffère : votre réseau ou votre appareil procède à une interception. Le site est sain, c'est votre environnement qui réécrit la connexion.
4. Essayer depuis un autre réseau (p. ex. données mobiles au lieu du Wi-Fi d'entreprise) ou un autre appareil.
5. Vérifier que la date et l'heure sont réglées automatiquement.
6. Si vous soupçonnez une véritable fraude (l'empreinte diffère ET vous êtes sur un réseau et un appareil personnels dont vous contrôlez la configuration), signaler l'incident à [kilamaericgabin@yahoo.fr](mailto:kilamaericgabin@yahoo.fr) en joignant une capture d'écran des détails du certificat observé.

## Infrastructure et transparence

| Couche | Fournisseur et configuration |
|---|---|
| Hébergement | GitHub Pages (réseau Fastly, points de présence globaux) |
| DNS | OVH, zone signée DNSSEC (algorithme RSA/SHA-256) |
| Autorité de certification | Let's Encrypt, renouvellement automatique |
| HTTPS | Forcé par GitHub Pages, redirection HTTP → HTTPS systématique |
| Logs CT | Émission publiée dans les journaux Certificate Transparency |

Tous les certificats émis pour *erickilama.com* sont publics et consultables via les liens crt.sh et Google CT ci-dessus. Toute émission frauduleuse serait détectable en moins d'une heure.

## Contact

Pour toute anomalie détectée ou pour vérifier l'authenticité d'un document circulant sous le nom d'Eric Gabin Kilama : [kilamaericgabin@yahoo.fr](mailto:kilamaericgabin@yahoo.fr).
