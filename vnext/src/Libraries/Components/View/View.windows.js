/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import type {ViewProps} from './ViewPropTypes';

import ReactNativeFeatureFlags from '../../ReactNative/ReactNativeFeatureFlags';
import flattenStyle from '../../StyleSheet/flattenStyle';
import TextAncestor from '../../Text/TextAncestor';
import ViewNativeComponent from './ViewNativeComponent';
import * as React from 'react';
import invariant from 'invariant'; // [Windows]
// [Windows
import type {KeyEvent} from '../../Types/CoreEventTypes';
// Windows]

export type Props = ViewProps;

/**
 * The most fundamental component for building a UI, View is a container that
 * supports layout with flexbox, style, some touch handling, and accessibility
 * controls.
 *
 * @see https://reactnative.dev/docs/view
 */
const View: React.AbstractComponent<
  ViewProps,
  React.ElementRef<typeof ViewNativeComponent>,
> = React.forwardRef(
  (
    {
      accessibilityElementsHidden,
      accessibilityLabel,
      accessibilityLabelledBy,
      accessibilityLevel, // Windows
      accessibilityLiveRegion,
      accessibilityPosInSet, // Windows
      accessibilitySetSize, // Windows
      accessibilityState,
      accessibilityValue,
      'aria-busy': ariaBusy,
      'aria-checked': ariaChecked,
      'aria-disabled': ariaDisabled,
      'aria-expanded': ariaExpanded,
      'aria-hidden': ariaHidden,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-level': ariaLevel,
      'aria-live': ariaLive,
      'aria-posinset': ariaPosinset, // Windows
      'aria-selected': ariaSelected,
      'aria-setsize': ariaSetsize, // Windows
      'aria-valuemax': ariaValueMax,
      'aria-valuemin': ariaValueMin,
      'aria-valuenow': ariaValueNow,
      'aria-valuetext': ariaValueText,
      focusable,
      disabled,
      id,
      importantForAccessibility,
      nativeID,
      pointerEvents,
      tabIndex,
      ...otherProps
    }: ViewProps,
    forwardedRef,
  ) => {
    const _accessibilityLabelledBy =
      ariaLabelledBy?.split(/\s*,\s*/g) ?? accessibilityLabelledBy;

    let _accessibilityState;
    if (
      accessibilityState != null ||
      ariaBusy != null ||
      ariaChecked != null ||
      ariaDisabled != null ||
      ariaExpanded != null ||
      ariaSelected != null
    ) {
      _accessibilityState = {
        busy: ariaBusy ?? accessibilityState?.busy,
        checked: ariaChecked ?? accessibilityState?.checked,
        disabled: ariaDisabled ?? accessibilityState?.disabled,
        expanded: ariaExpanded ?? accessibilityState?.expanded,
        selected: ariaSelected ?? accessibilityState?.selected,
      };
    }
    let _accessibilityValue;
    if (
      accessibilityValue != null ||
      ariaValueMax != null ||
      ariaValueMin != null ||
      ariaValueNow != null ||
      ariaValueText != null
    ) {
      _accessibilityValue = {
        max: ariaValueMax ?? accessibilityValue?.max,
        min: ariaValueMin ?? accessibilityValue?.min,
        now: ariaValueNow ?? accessibilityValue?.now,
        text: ariaValueText ?? accessibilityValue?.text,
      };
    }

    // $FlowFixMe[underconstrained-implicit-instantiation]
    let style = flattenStyle(otherProps.style);

    // $FlowFixMe[sketchy-null-mixed]
    const newPointerEvents = style?.pointerEvents || pointerEvents;
    const collapsableOverride =
      ReactNativeFeatureFlags.shouldForceUnflattenForElevation()
        ? {
            collapsable:
              style != null && style.elevation != null && style.elevation !== 0
                ? false
                : otherProps.collapsable,
          }
        : {};

    const _keyDown = (event: KeyEvent) => {
      if (otherProps.keyDownEvents && event.isPropagationStopped() !== true) {
        // $FlowFixMe - keyDownEvents was already checked to not be undefined
        for (const el of otherProps.keyDownEvents) {
          if (event.nativeEvent.code == el.code && el.handledEventPhase == 3) {
            event.stopPropagation();
          }
        }
      }
      otherProps.onKeyDown && otherProps.onKeyDown(event);
    };

    const _keyUp = (event: KeyEvent) => {
      if (otherProps.keyUpEvents && event.isPropagationStopped() !== true) {
        // $FlowFixMe - keyDownEvents was already checked to not be undefined
        for (const el of otherProps.keyUpEvents) {
          if (event.nativeEvent.code == el.code && el.handledEventPhase == 3) {
            event.stopPropagation();
          }
        }
      }
      otherProps.onKeyUp && otherProps.onKeyUp(event);
    };

    const _keyDownCapture = (event: KeyEvent) => {
      if (otherProps.keyDownEvents && event.isPropagationStopped() !== true) {
        // $FlowFixMe - keyDownEvents was already checked to not be undefined
        for (const el of otherProps.keyDownEvents) {
          if (event.nativeEvent.code == el.code && el.handledEventPhase == 1) {
            event.stopPropagation();
          }
        }
      }
      otherProps.onKeyDownCapture && otherProps.onKeyDownCapture(event);
    };

    const _keyUpCapture = (event: KeyEvent) => {
      if (otherProps.keyUpEvents && event.isPropagationStopped() !== true) {
        // $FlowFixMe - keyDownEvents was already checked to not be undefined
        for (const el of otherProps.keyUpEvents) {
          if (event.nativeEvent.code == el.code && el.handledEventPhase == 1) {
            event.stopPropagation();
          }
        }
      }
      otherProps.onKeyUpCapture && otherProps.onKeyUpCapture(event);
    };

    // [Windows
    // $FlowFixMe - children typing
    const childrenWithImportantForAccessibility = children => {
      const updatedChildren = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // $FlowFixMe[incompatible-use]
          if (child.props.children) {
            // $FlowFixMe[incompatible-type]
            return React.cloneElement(child, {
              accessible: false,
              children: childrenWithImportantForAccessibility(
                child.props.children,
              ),
            });
          } else {
            // $FlowFixMe[incompatible-type]
            return React.cloneElement(child, {accessible: false});
          }
        }
        return child;
      });
      if (updatedChildren.length == 1) {
        return updatedChildren[0];
      } else {
        return updatedChildren;
      }
    };

    const _focusable = tabIndex !== undefined ? !tabIndex : focusable;
    const _accessible =
      importantForAccessibility === 'no-hide-descendants'
        ? false
        : otherProps.accessible;

    if (_focusable === true && _accessible === false) {
      console.warn(
        'All focusable views should report proper accessibility information. Views marked as focusable should always be accessible.',
      );
    }

    // Windows]

    return (
      // [Windows
      // In core this is a TextAncestor.Provider value={false} See
      // https://github.com/facebook/react-native/commit/66601e755fcad10698e61d20878d52194ad0e90c
      // But since Views are not currently supported in Text, we do not need the extra provider
      <TextAncestor.Consumer>
        {hasTextAncestor => {
          invariant(
            !hasTextAncestor,
            'Nesting of <View> within <Text> is not currently supported.',
          );
          return (
            <ViewNativeComponent
              {...otherProps}
              {...collapsableOverride}
              accessibilityLiveRegion={
                ariaLive === 'off'
                  ? 'none'
                  : ariaLive ?? accessibilityLiveRegion
              }
              accessibilityLabel={ariaLabel ?? accessibilityLabel}
              accessibilityLevel={ariaLevel ?? accessibilityLevel}
              accessibilityPosInSet={ariaPosinset ?? accessibilityPosInSet}
              accessibilitySetSize={ariaSetsize ?? accessibilitySetSize}
              focusable={_focusable}
              disabled={disabled}
              accessibilityState={_accessibilityState}
              accessibilityElementsHidden={
                ariaHidden ?? accessibilityElementsHidden
              }
              accessibilityLabelledBy={_accessibilityLabelledBy}
              accessibilityValue={_accessibilityValue}
              importantForAccessibility={
                ariaHidden === true
                  ? 'no-hide-descendants'
                  : importantForAccessibility
              }
              nativeID={id ?? nativeID}
              style={style}
              // $FlowFixMe[incompatible-type]
              pointerEvents={newPointerEvents}
              ref={forwardedRef}
              onKeyDown={_keyDown}
              onKeyDownCapture={_keyDownCapture}
              onKeyUp={_keyUp}
              onKeyUpCapture={_keyUpCapture}
              // [Windows
              accessible={_accessible}
              children={
                importantForAccessibility === 'no-hide-descendants'
                  ? childrenWithImportantForAccessibility(otherProps.children)
                  : otherProps.children
              }
              // Windows]
            />
          );
        }}
      </TextAncestor.Consumer>
      // Windows]
    );
  },
);

View.displayName = 'View';

module.exports = View;
