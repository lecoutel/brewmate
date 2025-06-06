
import { KombuchaProfileData, InfusionTimesData } from '../types';

export const KOMBUCHA_PROFILES: KombuchaProfileData = {
  LIGHT_GENTLE: {
    tea_per_liter: 5,
    sugar_per_liter: 60,
    descriptions: {
      BLACK_TEA: "Attendez-vous à un kombucha délicat et accessible. Les notes de malt et de fruits secs du thé noir sont présentes mais subtiles, laissant place à une douceur miellée. L'acidité est douce et rafraîchissante, sans aucune agressivité. C'est la base parfaite pour laisser les fruits délicats (pêche, fraise) s'exprimer pleinement en seconde fermentation.",
      GREEN_TEA: "Un profil tout en finesse et en légèreté. Des notes florales et végétales dominent, avec une finale très nette et peu sucrée. L'acidité est vive mais discrète, rappelant une limonade maison. Idéal pour des ajouts comme le concombre, la menthe ou le gingembre frais.",
      MIXED_TEA: "L'équilibre en toute subtilité. Ce mélange offre une base douce avec un léger corps malté et une touche florale en finale. Très polyvalent, il permet de créer un kombucha équilibré qui ne dominera jamais les saveurs que vous choisirez d'ajouter par la suite."
    }
  },
  CLASSIC_BALANCED: {
    tea_per_liter: 7,
    sugar_per_liter: 70,
    descriptions: {
      BLACK_TEA: "Le kombucha de référence, riche et complexe. Vous obtiendrez un goût robuste avec des saveurs prononcées de pomme mûre et de cidre. L'acidité est bien présente et équilibre parfaitement la douceur résiduelle, créant une boisson à la fois corsée et désaltérante. C'est un excellent kombucha à boire tel quel.",
      GREEN_TEA: "Vif, herbacé et plein de caractère. Le goût est dominé par des notes d'agrumes et de pomme verte, avec une acidité marquée qui picote agréablement la langue. La finale est sèche et très rafraîchissante. Une base fantastique pour des infusions de houblon (dry-hop) ou des agrumes.",
      MIXED_TEA: "Le meilleur des deux mondes pour une complexité maximale. La profondeur et les notes fruitées du thé noir rencontrent la vivacité et les notes végétales du thé vert. Le résultat est un kombucha avec beaucoup de corps, une acidité franche et des saveurs qui évoluent en bouche."
    }
  },
  INTENSE_VINEGARY: {
    tea_per_liter: 9,
    sugar_per_liter: 80,
    descriptions: {
      BLACK_TEA: "Un kombucha puissant, audacieux et sans compromis. La structure tannique du thé noir est très présente, apportant une légère astringence. La fermentation, plus longue et plus active grâce au sucre supplémentaire, développe une forte acidité acétique rappelant le vinaigre de cidre de qualité. Pour les amateurs de sensations fortes.",
      GREEN_TEA: "Sec, percutant et très acide. Les délicates notes florales du thé vert sont ici transformées en une base intensément vive et vinaigrée. La finale est très sèche, presque sans sucre résiduel. Ce profil est souvent utilisé pour créer des 'shrubs' ou des vinaigrettes au kombucha.",
      MIXED_TEA: "Un profil complexe et intense. La structure tannique des deux thés se combine pour un résultat corsé, tandis que la double dose de nutriments alimente une fermentation qui pousse l'acidité à son maximum. Le résultat est un kombucha avec un 'punch' vinaigré prononcé, soutenu par une large palette de saveurs."
    }
  }
};

export const INFUSION_TIMES: InfusionTimesData = {
  BLACK_TEA: 10, // minutes
  GREEN_TEA: 7,  // minutes
  MIXED_TEA: 8,  // minutes
};
