/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Dashicon, IconButton, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import { registerBlockType, source } from '../../api';
import Editable from '../../editable';
import UrlInput from '../../url-input';
import BlockControls from '../../block-controls';
import ToggleControl from '../../inspector-controls/toggle-control';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';
import ColorPalette from '../../color-palette';
import ContrastChecker from '../../contrast-checker';
import InspectorControls from '../../inspector-controls';
import BlockDescription from '../../block-description';

const { attr, children } = source;
const { getComputedStyle } = window;

class ButtonBlock extends Component {
	constructor() {
		super( ...arguments );

		this.containers = {};
		this.fallbackColors = {};

		this.state = {
			fallbackBackgroundColor: undefined,
			fallbackTextColor: undefined,
		};

		this.updateAlignment = this.updateAlignment.bind( this );
		this.toggleClear = this.toggleClear.bind( this );
		this.bindRef = this.bindRef.bind( this );
	}

	componentDidMount() {
		this.grabColors();
	}

	componentDidUpdate() {
		this.grabColors();
	}

	updateAlignment( nextAlign ) {
		this.props.setAttributes( { align: nextAlign } );
	}

	toggleClear() {
		const { attributes, setAttributes } = this.props;
		setAttributes( { clear: ! attributes.clear } );
	}

	bindRef( node ) {
		if ( ! node ) {
			return;
		}

		this.containers.background = node;
		this.containers.text = node.querySelector( '[contenteditable="true"]' );
	}

	grabColors() {
		const { background, text } = this.containers;
		const { textColor, color } = this.props.attributes;
		const { fallbackTextColor, fallbackBackgroundColor } = this.state;

		if ( ! color && ! fallbackBackgroundColor && background ) {
			this.setState( { fallbackBackgroundColor: getComputedStyle( background ).backgroundColor } );
		}

		if ( ! textColor && ! fallbackTextColor && text ) {
			this.setState( { fallbackTextColor: getComputedStyle( text ).color } );
		}
	}

	render() {
		const {
			attributes,
			setAttributes,
			focus,
			setFocus,
			className,
		} = this.props;

		const {
			text,
			url,
			title,
			align,
			color,
			textColor,
			clear,
		} = attributes;

		const {
			fallbackBackgroundColor,
			fallbackTextColor,
		} = this.state;
		return [
			focus && (
				<BlockControls key="controls">
					<BlockAlignmentToolbar value={ align } onChange={ this.updateAlignment } />
				</BlockControls>
			),
			<span key="button" className={ className } title={ title } style={ { backgroundColor: color } } ref={ this.bindRef }>
				<Editable
					tagName="span"
					placeholder={ __( 'Add text…' ) }
					value={ text }
					focus={ focus }
					onFocus={ setFocus }
					onChange={ ( value ) => setAttributes( { text: value } ) }
					formattingControls={ [ 'bold', 'italic', 'strikethrough' ] }
					style={ {
						color: textColor,
					} }
					keepPlaceholderOnFocus
				/>
				{ focus &&
					<InspectorControls key="inspector">
						<BlockDescription>
							<p>{ __( 'A nice little button. Call something out with it.' ) }</p>
						</BlockDescription>

						<ToggleControl
							label={ __( 'Stand on a line' ) }
							checked={ !! clear }
							onChange={ this.toggleClear }
						/>
						<PanelBody title={ __( 'Button Background Color' ) }>
							<ColorPalette
								value={ color }
								onChange={ ( colorValue ) => setAttributes( { color: colorValue } ) }
							/>
						</PanelBody>
						<PanelBody title={ __( 'Button Text Color' ) }>
							<ColorPalette
								value={ textColor }
								onChange={ ( colorValue ) => setAttributes( { textColor: colorValue } ) }
							/>
						</PanelBody>
						<ContrastChecker
							textColor={ textColor || fallbackTextColor }
							backgroundColor={ color || fallbackBackgroundColor }
							isLargeText={ true }
						/>
					</InspectorControls>
				}
			</span>,
			focus && (
				<form
					className="blocks-button__inline-link"
					onSubmit={ ( event ) => event.preventDefault() }>
					<Dashicon icon="admin-links" />
					<UrlInput
						value={ url }
						onChange={ ( value ) => setAttributes( { url: value } ) }
					/>
					<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
				</form>
			),
		];
	}
}

registerBlockType( 'core/button', {
	title: __( 'Button' ),

	icon: 'button',

	category: 'layout',

	attributes: {
		url: {
			type: 'string',
			source: attr( 'a', 'href' ),
		},
		title: {
			type: 'string',
			source: attr( 'a', 'title' ),
		},
		text: {
			type: 'array',
			source: children( 'a' ),
		},
		align: {
			type: 'string',
			default: 'none',
		},
		color: {
			type: 'string',
		},
		textColor: {
			type: 'string',
		},
	},

	getEditWrapperProps( attributes ) {
		const { align, clear } = attributes;
		const props = {};

		if ( 'left' === align || 'right' === align || 'center' === align ) {
			props[ 'data-align' ] = align;
		}

		if ( clear ) {
			props[ 'data-clear' ] = 'true';
		}

		return props;
	},

	edit( props ) {
		return <ButtonBlock { ...props } />;
	},

	save( { attributes } ) {
		const { url, text, title, align, color, textColor } = attributes;

		return (
			<div className={ `align${ align }` } style={ { backgroundColor: color } }>
				<a href={ url } title={ title } style={ { color: textColor } }>
					{ text }
				</a>
			</div>
		);
	},
} );
