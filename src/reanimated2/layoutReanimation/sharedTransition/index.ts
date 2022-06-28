import { withTiming } from "../../animation";
import {
  ILayoutAnimationBuilder,
  LayoutAnimationFunction,
  LayoutAnimationsValues,
} from '../animationBuilder/commonTypes';
import { StyleProps } from '../../commonTypes';

const supportedProps = [
  'width',
  'height',
  'originX',
  'originY',
  // 'globalOriginX',
  // 'globalOriginY',
]

type AnimationFactoryType = (values: LayoutAnimationsValues) => StyleProps;

export class SharedTransition implements ILayoutAnimationBuilder {
  animationFactory: AnimationFactoryType;

  static createInstance(): SharedTransition {
    return new SharedTransition();
  }
  
  static custom(animationFactory: AnimationFactoryType): SharedTransition {
    return this.createInstance().custom(animationFactory);
  }

  custom(animationFactory: AnimationFactoryType): SharedTransition {
    this.animationFactory = animationFactory;
    return this;
  }

  static build(): LayoutAnimationFunction {
    return this.createInstance().build();
  }

  build(): LayoutAnimationFunction {
    const animationFactory = this.animationFactory;
    return (values) => {
      'worklet';
      let animations = {};
      const initialValues = {};
      
      if (animationFactory) {
        animations = animationFactory(values);
        for (const key in animations) {
          if (!supportedProps.includes(key)) {
            throw Error(`The prop '${key}' is not supported yet.`);
          }
        }
      } else {
        for (const propName of supportedProps) {
          const keyToTargetValue = 'target' + propName.charAt(0).toUpperCase() + propName.slice(1);
          animations[propName] = withTiming(values[keyToTargetValue], { duration: 1000 });
        }
      }
      // animations['backgroundColor'] = 'olive'

      for (const propName in animations) {
        const keyToCurrentValue = 'current' + propName.charAt(0).toUpperCase() + propName.slice(1);
        initialValues[propName] = values[keyToCurrentValue];
      }

      return { initialValues, animations };
    };
  }
}

export const DefaultSharedTransition = SharedTransition;
